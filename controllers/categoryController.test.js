import {
  createCategoryController,
  updateCategoryController,
  categoryController,
  singleCategoryController,
  deleteCategoryController,
} from "../controllers/categoryController.js";
import categoryModel from "../models/categoryModel.js";
import slugify from "slugify";

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
  describe("createCategoryController", () => {
    it("should return 400 if name is missing", async () => {
      req.body = {};
      await createCategoryController(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({ message: "Name is required" });
    });

    it("should return 409 if category already exists", async () => {
      req.body = { name: "Test" };
      categoryModel.findOne.mockResolvedValue({ name: "Test" });

      await createCategoryController(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "Category already exists",
      });
    });

    it("should create a new category", async () => {
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
  describe("updateCategoryController", () => {
    it("should update category successfully", async () => {
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

    it("should return 404 if category not found", async () => {
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
  describe("categoryController", () => {
    it("should return all categories", async () => {
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
  });

  // Get single category
  describe("singleCategoryController", () => {
    it("should return single category by slug", async () => {
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
  });

  // Delete category
  describe("deleteCategoryController", () => {
    it("should delete category successfully", async () => {
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

    it("should return 404 if category not found", async () => {
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
