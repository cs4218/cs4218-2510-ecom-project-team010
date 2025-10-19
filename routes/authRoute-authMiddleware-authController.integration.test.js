import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import authRoutes from "../routes/authRoute.js";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";
import orderModel from "../models/orderModel.js";

// use the REAL router here
const app = express();
app.use(express.json());
app.use("/api/v1/auth", authRoutes);

let mongoServer;

beforeAll(async () => {
    process.env.JWT_SECRET = "a-secret-key-for-testing"; // used by real middleware/controllers
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri(), { dbName: "auth-route-int" });
    await userModel.init(); // ensure unique indexes (e.g., email)
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
    return request(app).post("/api/v1/auth/register").send({ ...base, ...override });
}

async function loginUser({ email, password }) {
    return request(app).post("/api/v1/auth/login").send({ email, password });
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


async function createOrder({ buyerId, productIds, status = "Not Process" }) {
    return orderModel.create({
        products: productIds,
        payment: { id: "txn_123" },
        buyer: buyerId,
        status,
    });
}


// ------ Tests -------
describe("authRoute with authMiddleware and authController integration", () => {
    describe("Public flows (no middleware on route)", () => {
        it("POST /register registers a new user (controller invoked via route)", async () => {
            const res = await registerUser();
            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);

            // Confirm persistence
            const saved = await userModel.findOne({ email: res.body.user.email });
            expect(saved).not.toBeNull();
        });

        it("POST /login logs in an existing user and returns a token", async () => {
            const email = "loginok@example.com";
            const password = "password123";
            const reg = await registerUser({ email, password });
            expect(reg.status).toBe(201);

            const res = await loginUser({ email, password });
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.token).toBeDefined();
        });
    });

    describe("Protected flows (middleware enforced on route)", () => {
        it("GET /user-auth passes through requireSignIn and returns ok: true for authenticated user", async () => {
            const email = "user@example.com";
            const reg = await registerUser({ email });
            expect(reg.status).toBe(201);

            const login = await loginUser({ email, password: "password123" });
            expect(login.status).toBe(200);
            const token = login.body.token;

            // NOTE: Real middleware expects Authorization to be the raw token (no 'Bearer ')
            const res = await request(app)
                .get("/api/v1/auth/user-auth")
                .set("Authorization", token);

            expect(res.status).toBe(200);
            expect(res.body).toEqual({ ok: true });
        });

        it("GET /admin-auth is rejected (401) for non-admin and allowed for admin", async () => {
            const email = "maybeadmin@example.com";
            const reg = await registerUser({ email });
            expect(reg.status).toBe(201);

            // Login as normal user
            const login = await loginUser({ email, password: "password123" });
            const tokenUser = login.body.token;

            // Non-admin should be blocked by isAdmin
            const resUser = await request(app)
                .get("/api/v1/auth/admin-auth")
                .set("Authorization", tokenUser);
            expect(resUser.status).toBe(401);
            expect(resUser.body.success).toBe(false);
            expect(resUser.body.message).toMatch(/Unauthorized/i);

            // Elevate to admin (DB), then login again and retry
            await elevateToAdmin(email);
            const loginAdmin = await loginUser({ email, password: "password123" });
            const tokenAdmin = loginAdmin.body.token;

            const resAdmin = await request(app)
                .get("/api/v1/auth/admin-auth")
                .set("Authorization", tokenAdmin);
            expect(resAdmin.status).toBe(200);
            expect(resAdmin.body).toEqual({ ok: true });
        });

        it("GET /all-users invokes requireSignIn + isAdmin and returns the users list for admin", async () => {
            // Create an admin
            const adminEmail = "admin@example.com";
            const regAdmin = await registerUser({ adminEmail }); // NOTE: our helper expects 'email', fix below
            // Fix: correctly pass email
            const regAdmin2 = await registerUser({ email: adminEmail });
            expect(regAdmin2.status).toBe(201);
            await elevateToAdmin(adminEmail);
            const loginAdmin = await loginUser({ email: adminEmail, password: "password123" });
            const adminToken = loginAdmin.body.token;

            // Seed another user
            const u2 = await registerUser({ email: "someone@ex.com" });
            expect(u2.status).toBe(201);

            const res = await request(app)
                .get("/api/v1/auth/all-users")
                .set("Authorization", adminToken);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.users)).toBe(true);
            // Ensure sensitive fields are excluded by controller
            if (res.body.users.length > 0) {
                const one = res.body.users[0];
                expect(one.password).toBeUndefined();
                expect(one.answer).toBeUndefined();
            }
        });
    });

    describe("Orders (buyer & admin flows)", () => {
        it("GET /orders returns only the authenticated buyer's orders (populated)", async () => {
            // Buyer A
            const emailA = "a@example.com";
            const regA = await registerUser({ email: emailA });
            expect(regA.status).toBe(201);
            const loginA = await loginUser({ email: emailA, password: "password123" });
            const tokenA = loginA.body.token;
            const buyerA = await userModel.findOne({ email: emailA }).lean();

            // Buyer B
            const emailB = "b@example.com";
            const regB = await registerUser({ email: emailB });
            expect(regB.status).toBe(201);
            const buyerB = await userModel.findOne({ email: emailB }).lean();

            // Products
            const p1 = await createProduct({ name: "Mouse" });
            const p2 = await createProduct({ name: "Keyboard" });
            const p3 = await createProduct({ name: "Monitor" });

            // Orders for A and B
            await createOrder({ buyerId: buyerA._id, productIds: [p1._id, p2._id] });
            await createOrder({ buyerId: buyerB._id, productIds: [p3._id] });

            // Call real route (middleware requireSignIn reads raw token from Authorization header)
            const res = await request(app)
                .get("/api/v1/auth/orders")
                .set("Authorization", tokenA)
                .expect(200);

            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body).toHaveLength(1);

            const order = res.body[0];
            // controller populates buyer name + product data (excluding photo)
            expect(order.buyer.name).toBe("Test User");
            const productNames = order.products.map((p) => p.name).sort();
            expect(productNames).toEqual(["Keyboard", "Mouse"].sort());
        });

        it("GET /all-orders returns all orders for admin, sorted by createdAt desc", async () => {
            // Admin
            const adminEmail = "admin@example.com";
            const regAdmin = await registerUser({ email: adminEmail });
            expect(regAdmin.status).toBe(201);
            await elevateToAdmin(adminEmail);
            const adminLogin = await loginUser({ email: adminEmail, password: "password123" });
            const adminToken = adminLogin.body.token;

            // Buyers + orders
            const u1Email = "u1@example.com";
            const u2Email = "u2@example.com";
            const r1 = await registerUser({ email: u1Email });
            const r2 = await registerUser({ email: u2Email });
            expect(r1.status).toBe(201);
            expect(r2.status).toBe(201);

            const u1 = await userModel.findOne({ email: u1Email }).lean();
            const u2 = await userModel.findOne({ email: u2Email }).lean();

            const p1 = await createProduct({ name: "A" });
            const p2 = await createProduct({ name: "B" });

            const older = await createOrder({ buyerId: u1._id, productIds: [p1._id] });
            // ensure different timestamps for sorting
            await new Promise((r) => setTimeout(r, 10));
            const newer = await createOrder({ buyerId: u2._id, productIds: [p2._id] });

            const res = await request(app)
                .get("/api/v1/auth/all-orders")
                .set("Authorization", adminToken)
                .expect(200);

            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body).toHaveLength(2);

            // Sorted DESC by createdAt => newer first
            expect(res.body[0]._id).toBe(newer._id.toString());
            expect(res.body[1]._id).toBe(older._id.toString());

            // Populations should be present
            expect(res.body[0].buyer?.name).toBeDefined();
            expect(res.body[0].products?.[0]?.name).toBeDefined();
        });

        it("PUT /order-status/:orderId updates order status for admin", async () => {
            // Admin
            const adminEmail = "admin2@example.com";
            const regAdmin = await registerUser({ email: adminEmail });
            expect(regAdmin.status).toBe(201);
            await elevateToAdmin(adminEmail);
            const loginAdmin = await loginUser({ email: adminEmail, password: "password123" });
            const adminToken = loginAdmin.body.token;

            // Buyer + order
            const buyerEmail = "buyer@example.com";
            const regBuyer = await registerUser({ email: buyerEmail });
            expect(regBuyer.status).toBe(201);
            const buyer = await userModel.findOne({ email: buyerEmail }).lean();

            const prod = await createProduct({ name: "Thing" });
            const order = await createOrder({ buyerId: buyer._id, productIds: [prod._id] });

            const res = await request(app)
                .put(`/api/v1/auth/order-status/${order._id}`)
                .set("Authorization", adminToken)
                .send({ status: "Shipped" })
                .expect(200);

            expect(res.body.status).toBe("Shipped");

            const persisted = await orderModel.findById(order._id).lean();
            expect(persisted.status).toBe("Shipped");
        });

        it("guards admin-only order endpoints with isAdmin (401 for normal user)", async () => {
            const email = "normie@example.com";
            const reg = await registerUser({ email });
            expect(reg.status).toBe(201);
            const login = await loginUser({ email, password: "password123" });
            const token = login.body.token;

            const res = await request(app)
                .get("/api/v1/auth/all-orders")
                .set("Authorization", token);

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/unauthorized/i);
        });
    });
});
