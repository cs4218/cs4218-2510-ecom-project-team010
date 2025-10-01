import {
  createCategoryController,
  updateCategoryController,
  categoryController,
  singleCategoryController,
  deleteCategoryController,
} from "../controllers/categoryController.js";
import categoryModel from "../models/categoryModel.js";
import slugify from "slugify";

// Note: Some of these test cases are generated with the help of AI

jest.mock("../models/categoryModel.js");

describe("Category Controllers", () => {
    let req, res;

    beforeEach(() => {
        req = {};
        res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
        };
        jest.clearAllMocks();
    });

    // Create Category
    describe("Given a request to create a category", () => {
        test("When the name field is missing from the request body", async () => {
            req.body = {};
            await createCategoryController(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith({ message: "Name is required" });
        });

        test("When a category with the same name already exists", async () => {
            req.body = { name: "Test" };
            categoryModel.findOne.mockResolvedValue({ name: "Test" });

            await createCategoryController(req, res);

            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.send).toHaveBeenCalledWith({
                success: false,
                message: "Category already exists",
            });
        });

        test("When provided with valid category data", async () => {
            req.body = { name: "Test" };
            categoryModel.findOne.mockResolvedValue(null);
            categoryModel.prototype.save = jest.fn().mockResolvedValue({
                name: "Test",
                slug: slugify("Test"),
            });

            await createCategoryController(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    message: "New category created",
                })
            );
        });
    });

    // Update Category
    describe("Given a request to update an existing category", () => {
        test("When the category exists in the database", async () => {
            req.body = { name: "Updated" };
            req.params = { id: "123" };
            categoryModel.findByIdAndUpdate.mockResolvedValue({
                name: "Updated",
                slug: slugify("Updated"),
            });

            await updateCategoryController(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    message: "Category Updated Successfully",
                })
            );
        });

        test("When the category does not exist in the database", async () => {
            req.body = { name: "Updated" };
            req.params = { id: "123" };
            categoryModel.findByIdAndUpdate.mockResolvedValue(null);

            await updateCategoryController(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: "Category not found",
                })
            );
        });
    });

    // Get all categories
    describe("Given a request to retrieve all categories", () => {
        test("When categories exist in the database", async () => {
            const categories = [{ name: "Test" }];
            categoryModel.find.mockResolvedValue(categories);

            await categoryController(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    message: "Get All Categories Successfully",
                    category: categories,
                })
            );
        });

        test("When no categories exist in the database", async () => {
            const categories = [];
            categoryModel.find.mockResolvedValue(categories);

            await categoryController(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    message: "Get All Categories Successfully",
                    category: categories,
                })
            );
        });
    });

    // Get single category
    describe("Given a request to retrieve a single category by slug", () => {
        test("When the category exists with the provided slug", async () => {
            req.params = { slug: "test" };
            const category = { name: "Test", slug: "test" };
            categoryModel.findOne.mockResolvedValue(category);

            await singleCategoryController(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    message: "Get Single Category Successfully",
                    category,
                })
            );
        });

        test("When no category exists with the provided slug", async () => {
            req.params = { slug: "non-existent" };
            categoryModel.findOne.mockResolvedValue(null);

            await singleCategoryController(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    message: "Get Single Category Successfully",
                    category: null,
                })
            );
        });
    });

    // Delete category
    describe("Given a request to delete a category", () => {
        test("When the category exists in the database", async () => {
            req.params = { id: "123" };
            categoryModel.findByIdAndDelete.mockResolvedValue({ name: "Test" });

            await deleteCategoryController(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    message: "Category Deleted Successfully",
                })
            );
        });

        test("When the category does not exist in the database", async () => {
            req.params = { id: "123" };
            categoryModel.findByIdAndDelete.mockResolvedValue(null);

            await deleteCategoryController(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: "Category not found",
                })
            );
        });
    });
});
