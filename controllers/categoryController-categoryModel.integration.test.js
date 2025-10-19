import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import categoryModel from "../models/categoryModel.js";
import {
  createCategoryController,
  updateCategoryController,
  categoryController,
  singleCategoryController,
  deleteCategoryController,
} from "../controllers/categoryController.js";

// mock only external dependencies but not the model or controller
jest.mock("slugify", () => ({
    __esModule: true,
    default: (str) => str.toLowerCase().replace(/\s+/g, "-"),
}));

describe("Test integration between categoryController and categoryModel", () => {
    let mongoServer;
    let req, res;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    beforeEach(async () => {
        // clear database before each test
        await categoryModel.deleteMany({});

        req = { body: {}, params: {}, };
        res = { status: jest.fn().mockReturnThis(), send: jest.fn().mockReturnThis(), };
        jest.spyOn(console, "log").mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("createCategoryController Integration", () => {
        test("Should create a new category in database with slug generated", async () => {
            req.body = { name: "Electronics" };

            await createCategoryController(req, res);

            // assert controller response
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.send).toHaveBeenCalledWith({
                success: true,
                message: "New category created",
                category: expect.objectContaining({
                name: "Electronics",
                slug: "electronics",
                _id: expect.anything(),
                }),
            });

            // assert that data was actually saved in database via model
            const savedCategory = await categoryModel.findOne({ name: "Electronics" });
            expect(savedCategory).toBeTruthy();
            expect(savedCategory.name).toBe("Electronics");
            expect(savedCategory.slug).toBe("electronics");
        });

        test("Should handle model validation when name is missing", async () => {
            req.body = {};

            await createCategoryController(req, res);

            // assert response was handled by controller correctly 
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith({
                message: "Name is required",
            });

            // assert that nothing was saved to database
            const count = await categoryModel.countDocuments();
            expect(count).toBe(0);
        });

        test("should enforce unique constraint from model schema", async () => {
            await categoryModel.create({ name: "Electronics", slug: "electronics" });

            // attempt to create duplicate
            req.body = { name: "Electronics" };
            await createCategoryController(req, res);

            // assert response was handled by controller correctly 
            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.send).toHaveBeenCalledWith({
                success: false,
                message: "Category already exists",
            });

            // assert that no duplicate is saved to database
            const count = await categoryModel.countDocuments({ name: "Electronics" });
            expect(count).toBe(1);
        });
    });

    describe("updateCategoryController Integration", () => {
        test("Should update existing category in database with new slug", async () => {
            // Create initial category
            const category = await categoryModel.create({
                name: "Electronics",
                slug: "electronics",
            });

            req.params = { id: category._id.toString() };
            req.body = { name: "Electronics & Gadgets" };

            await updateCategoryController(req, res);

            // assert response was handled by controller correctly
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({
                success: true,
                message: "Category Updated Successfully",
                category: expect.objectContaining({
                name: "Electronics & Gadgets",
                slug: "electronics-&-gadgets",
                _id: category._id,
                }),
            });

            // assert that update is saved to database
            const updatedCategory = await categoryModel.findById(category._id);
            expect(updatedCategory.name).toBe("Electronics & Gadgets");
            expect(updatedCategory.slug).toBe("electronics-&-gadgets");
        });
    });

    describe("categoryController Integration", () => {
        test("Should retrieve all categories from database", async () => {
            await categoryModel.create({ name: "Electronics", slug: "electronics" });
            await categoryModel.create({ name: "Clothing", slug: "clothing" });
            await categoryModel.create({ name: "Books", slug: "books" });

            await categoryController(req, res);

            // assert request was handled by controller correctly
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({
                success: true,
                message: "Get All Categories Successfully",
                category: expect.arrayContaining([
                expect.objectContaining({ name: "Electronics" }),
                expect.objectContaining({ name: "Clothing" }),
                expect.objectContaining({ name: "Books" }),
                ]),
            });

            // assert that return result from request is correct
            const response = res.send.mock.calls[0][0];
            expect(response.category).toHaveLength(3);
            });

        test("Should return empty array when no categories exist", async () => {
            await categoryController(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({
                success: true,
                message: "Get All Categories Successfully",
                category: [],
            });
        });
    });

    describe("singleCategoryController Integration", () => {
        test("Should retrieve category by slug from database", async () => {
            await categoryModel.create({ name: "Electronics", slug: "electronics" });

            req.params = { slug: "electronics" };

            await singleCategoryController(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({
                success: true,
                message: "Get Single Category Successfully",
                category: expect.objectContaining({
                name: "Electronics",
                slug: "electronics",
                }),
            });
        });

        test("should return null category when slug not found", async () => {
            req.params = { slug: "non-existent" };

            await singleCategoryController(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({
                success: true,
                message: "Get Single Category Successfully",
                category: null,
            });
        });
    });

    describe("deleteCategoryController Integration", () => {
        test("Should delete category successfully from database", async () => {
            const category = await categoryModel.create({
                name: "Electronics",
                slug: "electronics",
            });
            req.params = { id: category._id.toString() };

            await deleteCategoryController(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({
                success: true,
                message: "Category Deleted Successfully",
            });

            // assert that category was actually deleted from database
            const deletedCategory = await categoryModel.findById(category._id);
            expect(deletedCategory).toBeNull();

            const count = await categoryModel.countDocuments();
            expect(count).toBe(0);
        });

        test("should return 404 when deleting non-existent category", async () => {
            const fakeId = new mongoose.Types.ObjectId();
            req.params = { id: fakeId.toString() };

            await deleteCategoryController(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.send).toHaveBeenCalledWith({
                success: false,
                message: "Category not found",
            });
        });

        test("Should only delete specified category and not others", async () => {
            await categoryModel.create({
                name: "Electronics",
                slug: "electronics",
            });
            await categoryModel.create({
                name: "Books",
                slug: "books",
            });

            const cat2 = await categoryModel.create({
                name: "Clothing",
                slug: "clothing",
            });

            req.params = { id: cat2._id.toString() };

            await deleteCategoryController(req, res);

            // assert that only cat2 was deleted
            const remaining = await categoryModel.find({});
            expect(remaining).toHaveLength(2);
            expect(remaining.map((c) => c.name)).toEqual(
                expect.arrayContaining(["Electronics", "Books"])
            );
            expect(remaining.map((c) => c.name)).not.toContain("Clothing");
        });
    });
});