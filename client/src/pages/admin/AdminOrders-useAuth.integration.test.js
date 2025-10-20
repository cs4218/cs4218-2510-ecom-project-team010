/** @jest-environment node */

import express from "express";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import JWT from "jsonwebtoken";
import dotenv from "dotenv";

import authRoutes from "../../../../routes/authRoute.js";
import userModel from "../../../../models/userModel.js";
import productModel from "../../../../models/productModel.js";
import orderModel from "../../../../models/orderModel.js";
import categoryModel from "../../../../models/categoryModel.js";

dotenv.config();

describe("Integration test between AdminOrders page and useAuth hook.", () => {
  let app;
  let mongoServer;
  let request;

  let adminUser;
  let regularUser;
  let adminToken;
  let regularToken;

  let category;
  let productA;
  let productB;
  let order;

  beforeAll(async () => {
    // Polyfills needed by supertest
    const { TextEncoder, TextDecoder } = await import("util");
    if (!global.TextEncoder) global.TextEncoder = TextEncoder;
    if (!global.TextDecoder) global.TextDecoder = TextDecoder;
    if (!global.crypto || !global.crypto.subtle) {
      global.crypto = (await import("crypto")).webcrypto;
    }

    // Dynamic import AFTER polyfills
    request = (await import("supertest")).default;

    // In-memory Mongo & Express app
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    app = express();
    app.use(express.json());
    app.use("/api/v1/auth", authRoutes);

    // Seed users
    adminUser = await userModel.create({
      name: "Admin User",
      email: "admin@test.com",
      password: "password123",
      phone: "1234567890",
      address: "123 Admin Street",
      answer: "test answer",
      role: 1, // Admin
    });

    regularUser = await userModel.create({
      name: "Regular User",
      email: "user@test.com",
      password: "password123",
      phone: "0987654321",
      address: "456 User Avenue",
      answer: "user answer",
      role: 0,
    });

    adminToken = JWT.sign({ _id: adminUser._id }, process.env.JWT_SECRET);
    regularToken = JWT.sign({ _id: regularUser._id }, process.env.JWT_SECRET);

    // Seed category 
    category = await categoryModel.create({ name: "Electronics", slug: "electronics" });

    // Seed products
    productA = await productModel.create({
      name: "Widget",
      slug: "widget",
      description: "A fancy widget",
      price: 99,
      category: category._id,
      quantity: 10,
      shipping: true,
    });

    productB = await productModel.create({
      name: "Gadget",
      slug: "gadget",
      description: "A smart gadget",
      price: 49,
      category: category._id,
      quantity: 5,
      shipping: false,
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await orderModel.deleteMany({});
    order = await orderModel.create({
      buyer: regularUser._id,
      products: [productA._id, productB._id],
      payment: { success: true },
    });
  });

  describe("GET /api/v1/auth/all-orders", () => {
    it("Only allows admin is allowed to list all orders", async () => {
      const res = await request(app)
        .get("/api/v1/auth/all-orders")
        .set("Authorization", adminToken);

      // correct status os reflected
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1); // 1 order is present

      const o = res.body[0];

      // AdminOrders reads all fields of order:
      // _id, status, buyer.name, createdAt, payment.success, products[].{_id,name,description,price}
      expect(o).toHaveProperty("_id", order._id.toString());
      expect(o).toHaveProperty("status", "Not Process"); 
      expect(o).toHaveProperty("buyer");
      expect(o.buyer).toHaveProperty("name", "Regular User");
      expect(o).toHaveProperty("createdAt");
      expect(o).toHaveProperty("payment");
      expect(o.payment).toHaveProperty("success", true);
      expect(o).toHaveProperty("products");
      expect(Array.isArray(o.products)).toBe(true);
      expect(o.products).toHaveLength(2);
      expect(o.products[0]).toEqual(
        expect.objectContaining({
          _id: expect.any(String),
          name: expect.any(String),
          description: expect.any(String),
          price: expect.any(Number),
        })
      );
    });

    it("rejects non-admin user", async () => {
      const res = await request(app)
        .get("/api/v1/auth/all-orders")
        .set("Authorization", regularToken);

      // correct status is reflected
      expect(res.status).toBe(401);
      expect(res.body).toEqual(
        expect.objectContaining({ success: false, message: "UnAuthorized Access" })
      );
    });
  });

  describe("PUT /api/v1/auth/order-status/:orderId", () => {
    it("only admin can update order status to a valid enum and it persists", async () => {
      const res = await request(app)
        .put(`/api/v1/auth/order-status/${order._id}`)
        .set("Authorization", adminToken)
        .send({ status: "Processing" });

      // correct status sent
      expect(res.status).toBe(200);

      // check that update is made
      const after = await orderModel.findById(order._id);
      expect(after.status).toBe("Processing");
    });

    it("rejects non-admin user", async () => {
      const res = await request(app)
        .put(`/api/v1/auth/order-status/${order._id}`)
        .set("Authorization", regularToken)
        .send({ status: "Processing" });

      // correct status sent
      expect(res.status).toBe(401);

      // no update made for non admin user
      const after = await orderModel.findById(order._id);
      expect(after.status).toBe("Not Process");
    });
    
  });
});