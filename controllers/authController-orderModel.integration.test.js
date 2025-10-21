import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import {
    registerController,
    loginController,
    forgotPasswordController,
    updateProfileController,
    getOrdersController,
    getAllOrdersController,
    orderStatusController,
} from "./authController.js";

import { requireSignIn, isAdmin } from "../middlewares/authMiddleware.js";
import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import productModel from "../models/productModel.js";


// Mock authMiddleware since this is not the interaction we are testing.
jest.mock("../middlewares/authMiddleware.js", () => ({
    __esModule: true,
    requireSignIn: (req, _res, next) => {
        // let tests set these headers to control the "current user"
        const userId = req.header("x-user-id");
        const role = Number(req.header("x-user-role") || 0);
        req.user = { _id: userId, role };
        next();
    },

    isAdmin: (req, res, next) => {
        if (req.user?.role === 1) return next();
        return res.status(401).send({ success: false, message: "UnAuthorized Access (mock)" });
    },
}));

// Wire controllers directly
const app = express();
app.use(express.json());

// Minimal routes that invoke the real controllers (no route mocks)
app.post("/api/v1/auth/register", registerController);
app.post("/api/v1/auth/login", loginController);
app.post("/api/v1/auth/forgot-password", forgotPasswordController);
app.put("/api/v1/auth/profile", requireSignIn, updateProfileController);

app.get("/api/v1/auth/orders", requireSignIn, getOrdersController);
app.get("/api/v1/auth/all-orders", requireSignIn, isAdmin, getAllOrdersController);
app.put("/api/v1/auth/order-status/:orderId", requireSignIn, isAdmin, orderStatusController);

let mongoServer;

beforeAll(async () => {
    process.env.JWT_SECRET = "a-secret-key-for-testing";
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri(), { dbName: "auth-ctrl-int" });

    // ensure indexes (e.g., user email unique) are ready
    await Promise.all([userModel.init(), orderModel.init(), productModel.init?.()]);
});

afterEach(async () => {
    const { collections } = mongoose.connection;
    for (const key of Object.keys(collections)) {
        await collections[key].deleteMany({});
    }
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

// Helper functions 
async function registerUser(override = {}) {
    const base = {
        name: "Test User",
        email: `user_${Math.random().toString(16).slice(2)}@example.com`,
        password: "password123",
        phone: "12345678",
        address: "Jurong East",
        answer: "blue",
    };
    const res = await request(app).post("/api/v1/auth/register").send({ ...base, ...override });
    return res;
}

async function elevateToAdmin(email) {
    await userModel.updateOne({ email }, { $set: { role: 1 } });
}

async function createProduct({ name = "Item", price = 99 }) {
    return productModel.create({
        name,
        slug: `${name.toLowerCase()}-${Math.random().toString(16).slice(2)}`,
        description: "Test product",
        price,
        category: new mongoose.Types.ObjectId(),
        quantity: 10,
    });
}

async function createOrder({ buyerId, productsIds, status = "Not Process" }) {
    return orderModel.create({
        products: productsIds,
        payment: { id: "txn_123" },
        buyer: buyerId,
        status,
    });
}

describe("authController with orderModel integration test", () => {
    // OrderModel interaction (Orders)
    describe("Orders (buyer & admin flows)", () => {
        it("GET /orders returns only the authenticated buyer's orders (populated)", async () => {
            // Buyer A
            const emailA = "a@example.com";
            const registerRes = await registerUser({ email: emailA })
            expect(registerRes.status).toBe(201);
            const buyerA = await userModel.findOne({ email: emailA }).lean();

            // Buyer B
            const emailB = "b@example.com";
            const registerResB = await registerUser({ email: emailB })
            expect(registerResB.status).toBe(201);
            const buyerB = await userModel.findOne({ email: emailB }).lean();

            // Products
            const p1 = await createProduct({ name: "Mouse" });
            const p2 = await createProduct({ name: "Keyboard" });
            const p3 = await createProduct({ name: "Monitor" });

            // Orders
            await createOrder({ buyerId: buyerA._id, productsIds: [p1._id, p2._id] });
            await createOrder({ buyerId: buyerB._id, productsIds: [p3._id] });

            const res = await request(app)
                .get("/api/v1/auth/orders")
                .set("x-user-id", buyerA._id.toString())
                .expect(200);

            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body).toHaveLength(1);
            const order = res.body[0];
            expect(order.buyer.name).toBe("Test User"); // default name from registerUser
            const productNames = order.products.map((p) => p.name).sort();
            expect(productNames).toEqual(["Keyboard", "Mouse"].sort());
        });

        it("GET /all-orders returns all orders for admin, sorted by createdAt desc", async () => {
            // Admin
            const adminEmail = "admin@example.com";
            const registerResAdmin = await registerUser({ email: adminEmail })
            expect(registerResAdmin.status).toBe(201);
            await elevateToAdmin(adminEmail);
            const admin = await userModel.findOne({ email: adminEmail }).lean();

            // Buyers + orders
            const u1Email = "u1@example.com";
            const u2Email = "u2@example.com";
            const registerRes1 = await registerUser({ email: u1Email })
            expect(registerRes1.status).toBe(201);
            const registerRes2 = await registerUser({ email: u2Email })
            expect(registerRes2.status).toBe(201);

            const u1 = await userModel.findOne({ email: u1Email }).lean();
            const u2 = await userModel.findOne({ email: u2Email }).lean();

            const p1 = await createProduct({ name: "A" });
            const p2 = await createProduct({ name: "B" });

            const older = await createOrder({ buyerId: u1._id, productsIds: [p1._id] });
            await new Promise((r) => setTimeout(r, 5));
            const newer = await createOrder({ buyerId: u2._id, productsIds: [p2._id] });

            const res = await request(app)
                .get("/api/v1/auth/all-orders")
                .set("x-user-id", admin._id.toString())
                .set("x-user-role", "1") // <- admin
                .expect(200);

            expect(res.body).toHaveLength(2);
            expect(res.body[0]._id).toBe(newer._id.toString());
            expect(res.body[1]._id).toBe(older._id.toString());
        });

        it("PUT /order-status/:orderId updates order status for admin", async () => {
            // Admin
            const adminEmail = "admin2@example.com";
            const registerRes = await registerUser({ email: adminEmail })
            expect(registerRes.status).toBe(201);
            await elevateToAdmin(adminEmail);
            const admin = await userModel.findOne({ email: adminEmail }).lean();

            // Buyer + order
            const buyerEmail = "buyer@example.com";
            const registerResBuyer = await registerUser({ email: buyerEmail })
            expect(registerResBuyer.status).toBe(201);
            const buyer = await userModel.findOne({ email: buyerEmail }).lean();

            const prod = await createProduct({ name: "Thing" });
            const order = await createOrder({ buyerId: buyer._id, productsIds: [prod._id] });

            const res = await request(app)
                .put(`/api/v1/auth/order-status/${order._id}`)
                .set("x-user-id", admin._id.toString())
                .set("x-user-role", "1") // <- admin
                .send({ status: "Shipped" })
                .expect(200);

            expect(res.body.status).toBe("Shipped");
            const persisted = await orderModel.findById(order._id).lean();
            expect(persisted.status).toBe("Shipped");
        });
    });
});
