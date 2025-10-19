import express from "express";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import JWT from "jsonwebtoken";
import categoryRoutes from "../routes/categoryRoutes.js";
import categoryModel from "../models/categoryModel.js";
import userModel from "../models/userModel.js";
import dotenv from 'dotenv';

// for JWT token from .env file
dotenv.config();

jest.mock("slugify", () => ({
    __esModule: true,
    default: (str) => str.toLowerCase().replace(/\s+/g, "-"),
}));

describe("Category Routes and Auth Middleware Integration Tests", () => {
    let app;
    let mongoServer;
    let adminUser;
    let regularUser;
    let adminToken;
    let regularToken;
    let invalidToken;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);

        app = express();
        app.use(express.json());
        app.use("/api/v1/category", categoryRoutes);

        // create test users with all required fields
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
            role: 0, // Normal user
        });
        adminToken = JWT.sign({ _id: adminUser._id }, process.env.JWT_SECRET);
        regularToken = JWT.sign({ _id: regularUser._id }, process.env.JWT_SECRET);
        invalidToken = "invalid.token.here";
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    beforeEach(async () => {
        await categoryModel.deleteMany({});
        jest.spyOn(console, "log").mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("POST /api/v1/category/create-category", () => {
        test("Should create category with valid admin token", async () => {
            const response = await request(app)
                .post("/api/v1/category/create-category")
                .set("Authorization", adminToken)
                .send({ name: "Electronics" });

            expect(response.status).toBe(201);
            expect(response.body).toEqual({
                success: true,
                message: "New category created",
                category: expect.objectContaining({
                    name: "Electronics",
                    slug: "electronics",
                    _id: expect.any(String),
                }),
            });

            const savedCategory = await categoryModel.findOne({ name: "Electronics" });
            expect(savedCategory).toBeTruthy();
        });

        test("Should reject non-admin users from creating category", async () => {
            const response = await request(app)
                .post("/api/v1/category/create-category")
                .set("Authorization", regularToken)
                .send({ name: "Electronics" });

            expect(response.status).toBe(401);
            expect(response.body).toEqual({
                success: false,
                message: "UnAuthorized Access",
            });

            const count = await categoryModel.countDocuments();
            expect(count).toBe(0);
        });
    });

    describe("PUT /api/v1/category/update-category/:id", () => {
        test("Should update category with valid admin token", async () => {
            const category = await categoryModel.create({
                name: "Electronics",
                slug: "electronics",
            });

            const response = await request(app)
                .put(`/api/v1/category/update-category/${category._id}`)
                .set("Authorization", adminToken)
                .send({ name: "Electronics & Gadgets" });

            expect(response.status).toBe(200);
            expect(response.body.category.name).toBe("Electronics & Gadgets");

            const updatedCategory = await categoryModel.findById(category._id);
            expect(updatedCategory.name).toBe("Electronics & Gadgets");
        });

        test("Should reject regular user for update", async () => {
            const category = await categoryModel.create({
                name: "Electronics",
                slug: "electronics",
            });

            const response = await request(app)
                .put(`/api/v1/category/update-category/${category._id}`)
                .set("Authorization", regularToken)
                .send({ name: "Updated Name" });

            expect(response.status).toBe(401);
            expect(response.body.message).toBe("UnAuthorized Access");

            const unchangedCategory = await categoryModel.findById(category._id);
            expect(unchangedCategory.name).toBe("Electronics");
        });
    });

    describe("GET /api/v1/category/get-category", () => {
        test("Should get all categories without authentication", async () => {
            await categoryModel.create({ name: "Electronics", slug: "electronics" });
            await categoryModel.create({ name: "Clothing", slug: "clothing" });

            const response = await request(app).get("/api/v1/category/get-category");

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.category).toHaveLength(2);
        });

        test("Should work for both admin and regular users", async () => {
            await categoryModel.create({ name: "Books", slug: "books" });

            // Test with admin token
            const adminResponse = await request(app)
                .get("/api/v1/category/get-category")
                .set("Authorization", adminToken);
            expect(adminResponse.status).toBe(200);

            // Test with regular token
            const userResponse = await request(app)
                .get("/api/v1/category/get-category")
                .set("Authorization", regularToken);
            expect(userResponse.status).toBe(200);

            // Test without token
            const noAuthResponse = await request(app).get("/api/v1/category/get-category");
            expect(noAuthResponse.status).toBe(200);
        });
    });

    describe("GET /api/v1/category/single-category/:slug", () => {
        test("Should get single category by slug without authentication", async () => {
            await categoryModel.create({ name: "Electronics", slug: "electronics" });

            const response = await request(app).get(
                "/api/v1/category/single-category/electronics"
            );

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.category.name).toBe("Electronics");
        });

        test("Should return null for non-existent slug", async () => {
            const response = await request(app).get(
                "/api/v1/category/single-category/non-existent"
            );

            expect(response.status).toBe(200);
            expect(response.body.category).toBeNull();
        });
    });

    describe("DELETE /api/v1/category/delete-category/:id", () => {
        test("Should delete category with valid admin token", async () => {
            const category = await categoryModel.create({
                name: "Electronics",
                slug: "electronics",
            });

            const response = await request(app)
                .delete(`/api/v1/category/delete-category/${category._id}`)
                .set("Authorization", adminToken);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                success: true,
                message: "Category Deleted Successfully",
            });

            const deletedCategory = await categoryModel.findById(category._id);
            expect(deletedCategory).toBeNull();
        });

        test("Should reject regular user for delete", async () => {
            const category = await categoryModel.create({
                name: "Electronics",
                slug: "electronics",
            });

            const response = await request(app)
                .delete(`/api/v1/category/delete-category/${category._id}`)
                .set("Authorization", regularToken);

            expect(response.status).toBe(401);
            expect(response.body.message).toBe("UnAuthorized Access");

            const stillExists = await categoryModel.findById(category._id);
            expect(stillExists).toBeTruthy();
        });
    });


    describe("Full Workflow Integration", () => {
        test("Should complete full CRUD workflow with proper authentication", async () => {
            const createRes = await request(app)
                .post("/api/v1/category/create-category")
                .set("Authorization", adminToken)
                .send({ name: "Electronics" });

            expect(createRes.status).toBe(201);
            const categoryId = createRes.body.category._id;

            // Get all categories -> no auth required
            const getAllRes = await request(app).get("/api/v1/category/get-category");
            expect(getAllRes.status).toBe(200);
            expect(getAllRes.body.category).toHaveLength(1);

            // Get single category -> no auth required
            const getSingleRes = await request(app).get(
                "/api/v1/category/single-category/electronics"
            );
            expect(getSingleRes.status).toBe(200);
            expect(getSingleRes.body.category.name).toBe("Electronics");

            // Update category -> admin required
            const updateRes = await request(app)
                .put(`/api/v1/category/update-category/${categoryId}`)
                .set("Authorization", adminToken)
                .send({ name: "Electronics Pro" });
            expect(updateRes.status).toBe(200);

            // assert that regular user cannot update
            const unauthorizedUpdateRes = await request(app)
                .put(`/api/v1/category/update-category/${categoryId}`)
                .set("Authorization", regularToken)
                .send({ name: "Hacked Name" });
            expect(unauthorizedUpdateRes.status).toBe(401);

            // assert that admin deleted category 
            const deleteRes = await request(app)
                .delete(`/api/v1/category/delete-category/${categoryId}`)
                .set("Authorization", adminToken);
            expect(deleteRes.status).toBe(200);
            const finalRes = await request(app).get("/api/v1/category/get-category");
            expect(finalRes.body.category).toHaveLength(0);
        });
    });
});