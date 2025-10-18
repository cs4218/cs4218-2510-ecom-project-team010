import express from "express";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import categoryRoutes from "../routes/categoryRoutes.js";
import categoryModel from "../models/categoryModel.js";

// Since we are only testing the integration between category routes and
// category controller, we mock only the auth middleware
jest.mock("../middlewares/authMiddleware.js", () => ({
    requireSignIn: jest.fn((req, res, next) => {
        req.user = { _id: "user123" };
        next();
    }),
    isAdmin: jest.fn((req, res, next) => {
        next();
    }),
}));

jest.mock("slugify", () => ({
    __esModule: true,
    default: (str) => str.toLowerCase().replace(/\s+/g, "-"),
}));

describe("Test integration between categoryRoutes and categoryController", () => {
    let app;
    let mongoServer;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);

        app = express();
        app.use(express.json());
        app.use("/api/v1/category", categoryRoutes);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    beforeEach(async () => {
        await categoryModel.deleteMany({});
        jest.spyOn(console, "log").mockImplementation(() => {});
        
        // Get the mocked functions and reset them to default behavior
        const authMiddleware = require("../middlewares/authMiddleware.js");
        
        authMiddleware.requireSignIn.mockImplementation((req, res, next) => {
            req.user = { _id: "user123" };
            next();
        });
        
        authMiddleware.isAdmin.mockImplementation((req, res, next) => {
            next();
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("POST /api/v1/category/create-category", () => {
        test("Should route to createCategoryController and create category with auth", async () => {
            const response = await request(app)
                .post("/api/v1/category/create-category")
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

            // assert that data is persisted through controller to database
            const savedCategory = await categoryModel.findOne({
                name: "Electronics",
            });
            expect(savedCategory).toBeTruthy();
            expect(savedCategory.slug).toBe("electronics");
        });

        test("Should enforce authentication before controller execution", async () => {
            // Get the mocked functions and override for this test
            const authMiddleware = require("../middlewares/authMiddleware.js");
            authMiddleware.requireSignIn.mockImplementationOnce((req, res) => {
                res.status(401).send({ message: "Unauthorized" });
            });

            const response = await request(app)
                .post("/api/v1/category/create-category")
                .send({ name: "Electronics" });

            expect(response.status).toBe(401);

            // assert controller never executed
            const count = await categoryModel.countDocuments();
            expect(count).toBe(0);
        });

        test("Should enforce isAdmin middleware before controller execution", async () => {
            const authMiddleware = require("../middlewares/authMiddleware.js");
            authMiddleware.isAdmin.mockImplementationOnce((req, res) => {
                res.status(403).send({ message: "Forbidden" });
            });

            const response = await request(app)
                .post("/api/v1/category/create-category")
                .send({ name: "Electronics" });

            expect(response.status).toBe(403);

            const count = await categoryModel.countDocuments();
            expect(count).toBe(0);
        });
    });

    describe("PUT /api/v1/category/update-category/:id", () => {
        test("Should route to updateCategoryController and update category", async () => {
            const category = await categoryModel.create({
                name: "Electronics",
                slug: "electronics",
            });

            const response = await request(app)
                .put(`/api/v1/category/update-category/${category._id}`)
                .send({ name: "Electronics & Gadgets" });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                success: true,
                message: "Category Updated Successfully",
                category: expect.objectContaining({
                name: "Electronics & Gadgets",
                slug: "electronics-&-gadgets",
                _id: category._id.toString(),
                }),
            });

            const updatedCategory = await categoryModel.findById(category._id);
            expect(updatedCategory.name).toBe("Electronics & Gadgets");
        });

        test("Should pass route parameter to controller correctly", async () => {
            const category = await categoryModel.create({
                name: "Electronics",
                slug: "electronics",
            });

            const response = await request(app)
                .put(`/api/v1/category/update-category/${category._id}`)
                .send({ name: "Updated Electronics" });

            expect(response.status).toBe(200);
            expect(response.body.category._id).toBe(category._id.toString());
        });

        test("should return 404 when category ID not found", async () => {
            const fakeId = new mongoose.Types.ObjectId();

            const response = await request(app)
                .put(`/api/v1/category/update-category/${fakeId}`)
                .send({ name: "Test" });

            expect(response.status).toBe(404);
            expect(response.body).toEqual({
                success: false,
                message: "Category not found",
            });
        });
    });

    describe("GET /api/v1/category/get-category", () => {
        test("Should route to categoryController and return all categories without auth", async () => {
            await categoryModel.create({ name: "Electronics", slug: "electronics" });
            await categoryModel.create({ name: "Clothing", slug: "clothing" });
            await categoryModel.create({ name: "Books", slug: "books" });

            const response = await request(app).get("/api/v1/category/get-category");

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                success: true,
                message: "Get All Categories Successfully",
                category: expect.arrayContaining([
                expect.objectContaining({ name: "Electronics" }),
                expect.objectContaining({ name: "Clothing" }),
                expect.objectContaining({ name: "Books" }),
                ]),
            });
            expect(response.body.category).toHaveLength(3);
        });
    });

    describe("GET /api/v1/category/single-category/:slug", () => {
        test("Should route to singleCategoryController and return category by slug", async () => {
            await categoryModel.create({ name: "Electronics", slug: "electronics" });

            const response = await request(app).get(
                "/api/v1/category/single-category/electronics"
            );

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                success: true,
                message: "Get Single Category Successfully",
                category: expect.objectContaining({
                name: "Electronics",
                slug: "electronics",
                }),
            });
        });

        test("Should pass slug parameter correctly from route to controller", async () => {
            await categoryModel.create({
                name: "Home & Garden",
                slug: "home-&-garden",
            });

            const response = await request(app).get(
                "/api/v1/category/single-category/home-&-garden"
            );

            expect(response.status).toBe(200);
            expect(response.body.category.slug).toBe("home-&-garden");
            });

            it("should return null when slug not found", async () => {
            const response = await request(app).get(
                "/api/v1/category/single-category/non-existent"
            );

            expect(response.status).toBe(200);
            expect(response.body.category).toBeNull();
        });
    });

    describe("DELETE /api/v1/category/delete-category/:id", () => {
        test("Should route to deleteCategoryController and delete category", async () => {
            const category = await categoryModel.create({
                name: "Electronics",
                slug: "electronics",
            });

            const response = await request(app).delete(
                `/api/v1/category/delete-category/${category._id}`
            );

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                success: true,
                message: "Category Deleted Successfully",
            });

            // asserted that category has been deleted 
            const deletedCategory = await categoryModel.findById(category._id);
            expect(deletedCategory).toBeNull();
        });

        test("Should enforce admin middleware on delete route", async () => {
            const category = await categoryModel.create({
                name: "Electronics",
                slug: "electronics",
            });

            const authMiddleware = require("../middlewares/authMiddleware.js");
            authMiddleware.isAdmin.mockImplementationOnce((req, res) => {
                res.status(403).send({ message: "Admin access required" });
            });

            const response = await request(app).delete(
                `/api/v1/category/delete-category/${category._id}`
            );

            expect(response.status).toBe(403);

            const stillExists = await categoryModel.findById(category._id);
            expect(stillExists).toBeTruthy();
        });
    });

    describe("Route Integration and Middleware Order", () => {
        test("Should execute middlewares as such: requireSignIn -> isAdmin -> controller", async () => {
            const authMiddleware = require("../middlewares/authMiddleware.js");
            const executionOrder = [];

            authMiddleware.requireSignIn.mockImplementationOnce((req, res, next) => {
                executionOrder.push("requireSignIn");
                next();
            });

            authMiddleware.isAdmin.mockImplementationOnce((req, res, next) => {
                executionOrder.push("isAdmin");
                next();
            });

            await request(app)
                .post("/api/v1/category/create-category")
                .send({ name: "Test" });

            expect(executionOrder).toEqual(["requireSignIn", "isAdmin"]);
        });

        test("Should handle all CRUD flow through routes correctly", async () => {
            // Create
            const createRes = await request(app)
                .post("/api/v1/category/create-category")
                .send({ name: "Electronics" });

            expect(createRes.status).toBe(201);
            const categoryId = createRes.body.category._id;

            // Get All
            const getAllRes = await request(app).get(
                "/api/v1/category/get-category"
            );
            expect(getAllRes.body.category).toHaveLength(1);

            // Get Single
            const getSingleRes = await request(app).get(
                "/api/v1/category/single-category/electronics"
            );
            expect(getSingleRes.body.category.name).toBe("Electronics");

            // Update
            const updateRes = await request(app)
                .put(`/api/v1/category/update-category/${categoryId}`)
                .send({ name: "Electronics Pro" });
            expect(updateRes.status).toBe(200);

            // Verify update
            const verifyRes = await request(app).get(
                "/api/v1/category/single-category/electronics-pro"
            );
            expect(verifyRes.body.category.name).toBe("Electronics Pro");

            // Delete
            const deleteRes = await request(app).delete(
                `/api/v1/category/delete-category/${categoryId}`
            );
            expect(deleteRes.status).toBe(200);

            // Verify deletion
            const finalRes = await request(app).get(
                "/api/v1/category/get-category"
            );
            expect(finalRes.body.category).toHaveLength(0);
        });
    });
});