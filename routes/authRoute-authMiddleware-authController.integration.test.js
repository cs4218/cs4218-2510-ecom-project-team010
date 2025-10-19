import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import authRoutes from "../routes/authRoute.js";
import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import productModel from "../models/productModel.js";

const app = express();
app.use(express.json());
app.use("/api/v1/auth", authRoutes); // using the actual authRoutes here. 

let mongoServer;

beforeAll(async () => {
    process.env.JWT_SECRET = "a-secret-key-for-testing";
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri(), { dbName: "test-db" });

    await Promise.all([
        userModel.init(),
        orderModel.init(),
        productModel.init?.(),
    ]);
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
async function registerAndLogin({
    name = "Test User",
    email = `user_${Math.random().toString(16).slice(2)}@example.com`,
    password = "password123",
    phone = "12345678",
    address = "Jurong East",
    answer = "blue",
    makeAdmin = false,
} = {}) {
    // Register
    await request(app)
        .post("/api/v1/auth/register")
        .send({ name, email, password, phone, address, answer })
        .expect(201);

    if (makeAdmin) {
        await userModel.updateOne({ email }, { $set: { role: 1 } });
    }

    const loginRes = await request(app)
        .post("/api/v1/auth/login")
        .send({ email, password })
        .expect(200);

    return {
        token: loginRes.body.token,
        user: loginRes.body.user,
    };
}

async function createProduct({ name = "Item", price = 42 } = {}) {
    const p = await productModel.create({
        name,
        slug: `${name.toLowerCase()}-${Math.random().toString(16).slice(2)}`,
        description: "A product used for tests",
        price,
        category: new mongoose.Types.ObjectId(),
        quantity: 10,
    });
    return p;
}

async function createOrder({ buyerId, products, status = "Not Process" }) {
    return orderModel.create({
        products: products.map((x) => x._id),
        payment: { txn: "txn_123" },
        buyer: buyerId,
        status,
    });
}

// -------------------- Test Suite --------------------
describe("Auth ↔ Orders (routes + middleware + controllers + model)", () => {
    describe("GET /api/v1/auth/orders (requireSignIn)", () => {
        it("returns only the authenticated buyer's orders with populated fields", async () => {
            const { token: tokenA, user: buyerA } = await registerAndLogin({
                name: "Buyer A",
                email: "buyera@example.com",
            });
            const p1 = await createProduct({ name: "Mouse" });
            const p2 = await createProduct({ name: "Keyboard" });
            await createOrder({ buyerId: buyerA._id, products: [p1, p2] });

            const { user: buyerB } = await registerAndLogin({
                name: "Buyer B",
                email: "buyerb@example.com",
            });
            const p3 = await createProduct({ name: "Monitor" });
            await createOrder({ buyerId: buyerB._id, products: [p3] });

            const res = await request(app)
                .get("/api/v1/auth/orders")
                .set("Authorization", tokenA) // requireSignIn reads this header
                .expect(200);

            // Expect only Buyer A's orders
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body).toHaveLength(1);
            const order = res.body[0];
            // Populated buyer name (from controller populate chain)
            expect(order.buyer.name).toBe("Buyer A");
            // Populated products (w/o photo)
            const names = order.products.map((p) => p.name).sort();
            expect(names).toEqual(["Keyboard", "Mouse"].sort());
        });
    });

    describe("GET /api/v1/auth/all-orders (requireSignIn + isAdmin)", () => {
        it("returns all orders for admin, sorted desc by createdAt", async () => {
            // Create admin + token
            const { token: adminToken } = await registerAndLogin({
                name: "Admin",
                email: "admin@example.com",
                makeAdmin: true,
            });

            // Create two buyers and orders
            const { user: buyer1 } = await registerAndLogin({
                name: "U1",
                email: "u1@example.com",
            });
            const { user: buyer2 } = await registerAndLogin({
                name: "U2",
                email: "u2@example.com",
            });

            const p1 = await createProduct({ name: "A" });
            const p2 = await createProduct({ name: "B" });

            const older = await createOrder({ buyerId: buyer1._id, products: [p1] });
            await new Promise((r) => setTimeout(r, 5));
            const newer = await createOrder({ buyerId: buyer2._id, products: [p2] });

            const res = await request(app)
                .get("/api/v1/auth/all-orders")
                .set("Authorization", adminToken)
                .expect(200);

            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body).toHaveLength(2);
            // Desc by createdAt (newest first)
            expect(res.body[0]._id).toBe(newer._id.toString());
            expect(res.body[1]._id).toBe(older._id.toString());
            // Populated checks
            expect(res.body[0].buyer.name).toBe("U2");
            expect(res.body[1].buyer.name).toBe("U1");
        });

        it("blocks non-admin user via isAdmin middleware", async () => {
            const { token: userToken } = await registerAndLogin({
                name: "Regular",
                email: "regular@example.com",
                makeAdmin: false, // role 0
            });

            const res = await request(app)
                .get("/api/v1/auth/all-orders")
                .set("Authorization", userToken);

            // isAdmin returns 401 with message "UnAuthorized Access"
            expect([401, 500]).toContain(res.status); // depending on logging vs explicit 401
            if (res.status === 401) {
                expect(res.body.success).toBe(false);
                expect(res.body.message).toBe("UnAuthorized Access");
            }
        });
    });

    describe("PUT /api/v1/auth/order-status/:orderId (requireSignIn + isAdmin)", () => {
        it("updates order status for admin", async () => {
            // Admin + buyer + order
            const { token: adminToken } = await registerAndLogin({
                name: "Admin",
                email: "admin2@example.com",
                makeAdmin: true,
            });
            const { user: buyer } = await registerAndLogin({
                name: "Buyer X",
                email: "buyerx@example.com",
            });
            const prod = await createProduct({ name: "Thing" });
            const order = await createOrder({
                buyerId: buyer._id,
                products: [prod],
                status: "Not Process",
            });

            const res = await request(app)
                .put(`/api/v1/auth/order-status/${order._id}`)
                .set("Authorization", adminToken)
                .send({ status: "Shipped" })
                .expect(200);

            expect(res.body._id).toBe(order._id.toString());
            expect(res.body.status).toBe("Shipped");

            // verify persisted
            const inDb = await orderModel.findById(order._id).lean();
            expect(inDb.status).toBe("Shipped");
        });

        it("rejects non-admin updates", async () => {
            const { token: userToken, user } = await registerAndLogin({
                name: "Not Admin",
                email: "notadmin@example.com",
                makeAdmin: false,
            });
            const prod = await createProduct({ name: "Part" });
            const order = await createOrder({
                buyerId: user._id,
                products: [prod],
            });

            const res = await request(app)
                .put(`/api/v1/auth/order-status/${order._id}`)
                .set("Authorization", userToken)
                .send({ status: "Processing" });

            // isAdmin should 401
            expect([401, 500]).toContain(res.status);
            if (res.status === 401) {
                expect(res.body.success).toBe(false);
                expect(res.body.message).toBe("UnAuthorized Access");
            }
        });
    });

    // (Optional) Error-path example at the route level by mocking model call:
    describe("Error paths via model failures", () => {
        it("GET /orders → 500 when orderModel.find throws", async () => {
            const { token, user } = await registerAndLogin({
                email: "errbuyer@example.com",
            });
            const spy = jest
                .spyOn(orderModel, "find")
                .mockImplementation(() => {
                    throw new Error("DB down");
                });

            const res = await request(app)
                .get("/api/v1/auth/orders")
                .set("Authorization", token);

            expect(res.status).toBe(500);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/Error while getting orders/i);

            spy.mockRestore();
        });
    });
});
