// Note: these test cases are generated with the help of AI

import fs from "fs";
import slugify from "slugify";
import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js";
import orderModel from "../models/orderModel.js";
import {
  getProductController,
  getSingleProductController,
  productPhotoController,
  productFiltersController,
  productCountController,
  productListController,
  searchProductController,
  realtedProductController,
  productCategoryController,
} from "./productController.js";

const originalConsoleLog = console.log;
const mockConsoleLog = jest.fn();

beforeAll(() => {
  console.log = mockConsoleLog;
});

afterAll(() => {
  console.log = originalConsoleLog;
});

beforeEach(() => {
  mockConsoleLog.mockClear();
});


jest.mock("../models/productModel.js", () => {
  const productModelMock = jest.fn(() => ({ photo: {}, save: jest.fn() }));
  productModelMock.find = jest.fn();
  productModelMock.findOne = jest.fn();
  productModelMock.findById = jest.fn();
  productModelMock.findByIdAndDelete = jest.fn(() => ({
    select: jest.fn().mockResolvedValue({}),
  }));
  productModelMock.findByIdAndUpdate = jest.fn(() => ({
    photo: {},
    save: jest.fn().mockResolvedValue(undefined),
  }));
  return {
    __esModule: true,
    default: productModelMock,
  };
});
jest.mock("../models/categoryModel.js", () => {
  const categoryModelMock = jest.fn();
  categoryModelMock.findOne = jest.fn();
  return {
    __esModule: true,
    default: categoryModelMock,
  };
});
jest.mock("../models/orderModel.js", () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock("fs", () => ({
  __esModule: true,
  default: { readFileSync: jest.fn(() => Buffer.from("fake-bytes")) },
}));
jest.mock("slugify", () => ({
  __esModule: true,
  default: jest.fn(() => "mock-slug"),
}));
jest.mock("braintree", () => ({
  __esModule: true,
  default: {
    BraintreeGateway: jest.fn(() => ({})),
    Environment: { Sandbox: "Sandbox" },
  },
}));
jest.mock("dotenv", () => ({
  __esModule: true,
  default: { config: jest.fn() },
  config: jest.fn(),
}));



describe("Testing createProductController function.", () => {

  let createProductController;
  beforeAll(async () => {
    ({ createProductController } = await import(
      "../controllers/productController.js"
    ));
  });

  beforeEach(() => {
    jest.clearAllMocks();
    fs.readFileSync.mockReset?.();
    fs.readFileSync.mockReturnValue(Buffer.from("fake-bytes"));
    slugify.mockReset?.();
    slugify.mockReturnValue("mock-slug");
  });

  it("400 if no name field.", async () => {
    // arrange
    const req = {
      fields: {
        description: "A fun game to enjoy with friends.",
        price: 2500,
        category: "Devices",
        quantity: 5,
        shipping: true,
      },
      files: {
        photo: { size: 1, path: "/tmp/p.jpg", type: "image/jpeg" },
      },
    };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

    // act
    await createProductController(req, res);

    //assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      error: "Name is Required",
    });
  });

  it("400 if photo > 1MB.", async () => {
    // arrange
    const req = {
      fields: {
        name: "Nintendo Switch",
        description: "A fun game to enjoy with friends.",
        price: 2500,
        category: "Devices",
        quantity: 5,
        shipping: true,
      },
      files: {
        photo: { size: 1_000_001, path: "/tmp/p.jpg", type: "image/jpeg" }, // > 1MB
      },
    };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

    // act
    await createProductController(req, res);

    // assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      error: "Photo is Required and should be less then 1mb",
    });
  });

  it("400 if no description field.", async () => {
    // arrange
    const req = {
      fields: {
        name: "Nintendo Switch",
        price: 2500,
        category: "Devices",
        quantity: 5,
        shipping: true,
      },
      files: {
        photo: { size: 1, path: "/tmp/p.jpg", type: "image/jpeg" },
      },
    };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

    // act
    await createProductController(req, res);

    // assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      error: "Description is Required",
    });
  });

  it("400 if no price field.", async () => {
    // arrange
    const req = {
      fields: {
        name: "Nintendo Switch",
        description: "A fun game to enjoy with friends.",
        category: "Devices",
        quantity: 5,
        shipping: true,
      },
      files: {
        photo: { size: 1, path: "/tmp/p.jpg", type: "image/jpeg" },
      },
    };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

    // act
    await createProductController(req, res);

    // assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      error: "Price is Required",
    });
  });

  it("400 if no category field.", async () => {
    // arrange
    const req = {
      fields: {
        name: "Nintendo Switch",
        description: "A fun game to enjoy with friends.",
        price: 2500,
        quantity: 5,
        shipping: true,
      },
      files: {
        photo: { size: 1_000_001, path: "/tmp/p.jpg", type: "image/jpeg" },
      },
    };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

    // act
    await createProductController(req, res);

    // assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      error: "Category is Required",
    });
  });

  it("400 if no quantity field.", async () => {
    // arrange
    const req = {
      fields: {
        name: "Nintendo Switch",
        description: "A fun game to enjoy with friends.",
        price: 2500,
        category: "Devices",
        shipping: true,
      },
      files: {
        photo: { size: 1, path: "/tmp/p.jpg", type: "image/jpeg" },
      },
    };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

    // act
    await createProductController(req, res);

    // assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      error: "Quantity is Required",
    });
  });

  it("201 if product is saved successfully.", async () => {
    // arrange
    const req = {
      fields: {
        name: "Nintendo Switch",
        description: "A fun game to enjoy with friends.",
        price: 2500,
        category: "Devices",
        quantity: "5",
        shipping: true,
      },
      files: {
        photo: { size: 1, path: "/tmp/p.jpg", type: "image/jpeg" },
      },
    };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

    // act
    await createProductController(req, res);
    const payload = res.send.mock.calls[0][0];

    // assert
    expect(res.status).toHaveBeenCalledWith(201);
    expect(payload).toEqual(
      expect.objectContaining({
        success: true,
        message: "Product Created Successfully",
        products: expect.any(Object),
      })
    );
  });

  it("400 with error payload if DB save fails.", async () => {
    // arrange
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    productModel.mockImplementationOnce(() => ({
      photo: {},
      save: jest.fn().mockRejectedValue(new Error("DB down")),
    }));

    const req = {
      fields: {
        name: "Nintendo Switch",
        description: "A fun game to enjoy with friends.",
        price: 2500,
        category: "Devices",
        quantity: 5,
        shipping: true,
      },
      files: {
        photo: { size: 100, path: "/tmp/p.jpg", type: "image/jpeg" },
      },
    };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

    // act
    await createProductController(req, res);
    const payload = res.send.mock.calls[0][0];

    // assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(payload).toEqual(
      expect.objectContaining({
        success: false,
        message: "Error in creating product",
      })
    );
    expect(payload.error).toBeInstanceOf(Error);
    expect(payload.error.message).toBe("DB down");
    expect(logSpy).toHaveBeenCalledWith(expect.any(Error));
    logSpy.mockRestore();
  });
});

describe("Testing updateProductController function.", () => {
  let updateProductController;
  beforeAll(async () => {
    ({ updateProductController } = await import(
      "../controllers/productController.js"
    ));
  });

  beforeEach(() => {
    jest.clearAllMocks();
    fs.readFileSync.mockReset?.();
    fs.readFileSync.mockReturnValue(Buffer.from("fake-bytes"));
    slugify.mockReset?.();
    slugify.mockReturnValue("mock-slug");
  });

  it("400 if no name field.", async () => {
    // arrange
    const req = {
      fields: {
        description: "A fun game to enjoy with friends.",
        price: 2500,
        category: "Devices",
        quantity: 5,
        shipping: true,
      },
      files: {
        photo: { size: 1, path: "/tmp/p.jpg", type: "image/jpeg" },
      },
    };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

    // act
    await updateProductController(req, res);

    // assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      error: "Name is Required",
    });
  });

  it("400 if photo > 1MB.", async () => {
    // arrange
    const req = {
      fields: {
        name: "Nintendo Switch",
        description: "A fun game to enjoy with friends.",
        price: 2500,
        category: "Devices",
        quantity: 5,
        shipping: true,
      },
      files: {
        photo: { size: 1_000_001, path: "/tmp/p.jpg", type: "image/jpeg" },
      },
    };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

    // act
    await updateProductController(req, res);

    // assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      error: "Photo is Required and should be less then 1mb",
    });
  });

  it("400 if no description field.", async () => {
    // arrange
    const req = {
      fields: {
        name: "Nintendo Switch",
        price: 2500,
        category: "Devices",
        quantity: 5,
        shipping: true,
      },
      files: {
        photo: { size: 1, path: "/tmp/p.jpg", type: "image/jpeg" },
      },
    };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

    // act
    await updateProductController(req, res);

    // assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      error: "Description is Required",
    });
  });

  it("400 if no price field.", async () => {
    // arrange
    const req = {
      fields: {
        name: "Nintendo Switch",
        description: "A fun game to enjoy with friends.",
        category: "Devices",
        quantity: 5,
        shipping: true,
      },
      files: {
        photo: { size: 1, path: "/tmp/p.jpg", type: "image/jpeg" },
      },
    };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

    // act
    await updateProductController(req, res);

    // assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      error: "Price is Required",
    });
  });

  it("400 if no category field.", async () => {
    // arrange
    const req = {
      fields: {
        name: "Nintendo Switch",
        description: "A fun game to enjoy with friends.",
        price: 2500,
        quantity: 5,
        shipping: true,
      },
      files: {
        photo: { size: 1_000_001, path: "/tmp/p.jpg", type: "image/jpeg" },
      },
    };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

    // act
    await updateProductController(req, res);

    // assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      error: "Category is Required",
    });
  });

  it("400 if no quantity field.", async () => {
    // arrange
    const req = {
      fields: {
        name: "Nintendo Switch",
        description: "A fun game to enjoy with friends.",
        price: 2500,
        category: "Devices",
        shipping: true,
      },
      files: {
        photo: { size: 1, path: "/tmp/p.jpg", type: "image/jpeg" },
      },
    };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

    // act
    await updateProductController(req, res);

    // arrange
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      error: "Quantity is Required",
    });
  });

  it("201 if product is updated successfully.", async () => {
    // arange
    const req = {
      params: { pid: "123" },
      fields: {
        name: "Nintendo Switch",
        description: "A fun game to enjoy with friends.",
        price: 2500,
        category: "Devices",
        quantity: "5",
        shipping: true,
      },
      files: {
        photo: { size: 1, path: "/tmp/p.jpg", type: "image/jpeg" },
      },
    };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

    // act
    await updateProductController(req, res);
    const payload = res.send.mock.calls[0][0];

    // assert
    expect(res.status).toHaveBeenCalledWith(201);
    expect(payload).toEqual(
      expect.objectContaining({
        success: true,
        message: "Product Updated Successfully",
        products: expect.any(Object),
      })
    );
  });

  it("400 with error payload if DB update fails.", async () => {
    // arrange
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    productModel.findByIdAndUpdate.mockRejectedValueOnce(
      new Error("DB update down")
    );

    const req = {
      params: { pid: "123" },
      fields: {
        name: "A",
        description: "B",
        price: 1,
        category: "C",
        quantity: 1,
        shipping: false,
      },
      files: { photo: { size: 100, path: "/tmp/p.jpg", type: "image/jpeg" } },
    };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

    // act
    await updateProductController(req, res);

    // assert
    expect(res.status).toHaveBeenCalledWith(400);
    const payload = res.send.mock.calls[0][0];
    expect(payload.success).toBe(false);
    expect(payload.message).toBe("Error in Update product");
    expect(payload.error).toBeInstanceOf(Error);
    expect(payload.error.message).toBe("DB update down");
    logSpy.mockRestore();
  });
});

describe("Testing deleteProductController function.", () => {
  let deleteProductController;

  beforeAll(async () => {
    ({ deleteProductController } = await import(
      "../controllers/productController.js"
    ));
  });

  let logSpy;
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("200 if product is deleted successfully.", async () => {
    // arrange
    productModel.findByIdAndDelete.mockReturnValueOnce({
      select: jest.fn().mockResolvedValue({}),
    });
    const req = { params: { pid: "123" } };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

    // act
    await deleteProductController(req, res);
    const selectMock =
      productModel.findByIdAndDelete.mock.results[0].value.select;

    // assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Product Deleted successfully",
    });
  });

  it("400 if DB delete/select rejects.", async () => {
    // arrange
    logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    productModel.findByIdAndDelete.mockReturnValueOnce({
      select: jest.fn().mockRejectedValue(new Error("DB delete failed")),
    });
    const req = { params: { pid: "999" } };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

    // act
    await deleteProductController(req, res);
    const payload = res.send.mock.calls[0][0];

    // assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(payload).toEqual(
      expect.objectContaining({
        success: false,
        message: "Error while deleting product",
        error: expect.any(Error),
      })
    );
    expect(payload.error.message).toBe("DB delete failed");
    logSpy.mockRestore();
  });
});

// ===== NEW TESTS FOR REQUESTED ENDPOINTS =====

describe("Testing getProductController", () => {
  let req, res, mockProducts;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    mockProducts = [
      { _id: "1", name: "Product 1", category: "cat1" },
      { _id: "2", name: "Product 2", category: "cat2" },
    ];
  });

  it("should return all products successfully", async () => {
    // arrange
    productModel.find.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(mockProducts),
          }),
        }),
      }),
    });

    // act
    await getProductController(req, res);

    // assert
    expect(productModel.find).toHaveBeenCalledWith({});
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      counTotal: 2,
      message: "All Products",
      products: mockProducts,
    });
  });

  it("should handle database errors", async () => {
    // arrange
    productModel.find.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            sort: jest.fn().mockRejectedValue(new Error("DB Error")),
          }),
        }),
      }),
    });

    // act
    await getProductController(req, res);

    // assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error in getting products", 
      error: "DB Error",
    });
  });
});

describe("Testing getSingleProductController", () => {
  let req, res, mockProduct;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { params: { slug: "test-product" } };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    mockProduct = { _id: "1", name: "Test Product", slug: "test-product" };
  });

  it("should return single product successfully", async () => {
    // arrange
    productModel.findOne.mockReturnValue({
      select: jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockProduct),
      }),
    });

    // act
    await getSingleProductController(req, res);

    // assert
    expect(productModel.findOne).toHaveBeenCalledWith({ slug: "test-product" });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Single Product Fetched",
      product: mockProduct,
    });
  });

  it("should handle database errors", async () => {
    // arrange
    productModel.findOne.mockReturnValue({
      select: jest.fn().mockReturnValue({
        populate: jest.fn().mockRejectedValue(new Error("DB Error")),
      }),
    });

    // act
    await getSingleProductController(req, res);

    // assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error while getting single product", 
      error: expect.any(Error),
    });
  });
});

describe("Testing productPhotoController", () => {
  let req, res, mockProduct;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { params: { pid: "product123" } };
    res = {
      set: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    mockProduct = {
      photo: {
        data: Buffer.from("fake-image-data"),
        contentType: "image/jpeg",
      },
    };
  });

  it("should return product photo successfully", async () => {
    // arrange
    productModel.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockProduct),
    });

    // act
    await productPhotoController(req, res);

    // assert
    expect(productModel.findById).toHaveBeenCalledWith("product123");
    expect(res.set).toHaveBeenCalledWith("Content-type", "image/jpeg");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(Buffer.from("fake-image-data"));
  });

  it("should handle database errors", async () => {
    // arrange
    productModel.findById.mockReturnValue({
      select: jest.fn().mockRejectedValue(new Error("DB Error")),
    });

    // act
    await productPhotoController(req, res);

    // assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error while getting photo", 
      error: expect.any(Error),
    });
  });
});

describe("Testing productFiltersController", () => {
  let req, res, mockProducts;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      body: {
        checked: ["category1", "category2"],
        radio: [100, 500],
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    mockProducts = [
      { _id: "1", name: "Product 1", price: 200 },
      { _id: "2", name: "Product 2", price: 300 },
    ];
  });

  it("should filter products by category and price", async () => {
    // arrange
    productModel.find.mockResolvedValue(mockProducts);

    // act
    await productFiltersController(req, res);

    // assert
    expect(productModel.find).toHaveBeenCalledWith({
      category: ["category1", "category2"],
      price: { $gte: 100, $lte: 500 },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      products: mockProducts,
    });
  });

  it("should handle empty filters", async () => {
    // arrange
    req.body = { checked: [], radio: [] };
    productModel.find.mockResolvedValue(mockProducts);

    // act
    await productFiltersController(req, res);

    // assert
    expect(productModel.find).toHaveBeenCalledWith({});
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should handle database errors", async () => {
    // arrange
    productModel.find.mockRejectedValue(new Error("DB Error"));

    // act
    await productFiltersController(req, res);

    // assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error While Filtering Products", 
      error: expect.any(Error),
    });
  });
});

describe("Testing productCountController", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  it("should return product count successfully", async () => {
    // arrange
    productModel.find.mockReturnValue({
      estimatedDocumentCount: jest.fn().mockResolvedValue(25),
    });

    // act
    await productCountController(req, res);

    // assert
    expect(productModel.find).toHaveBeenCalledWith({});
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      total: 25,
    });
  });

  it("should handle database errors", async () => {
    // arrange
    productModel.find.mockReturnValue({
      estimatedDocumentCount: jest.fn().mockRejectedValue(new Error("DB Error")),
    });

    // act
    await productCountController(req, res);

    // assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      message: "Error in product count",
      error: expect.any(Error),
      success: false,
    });
  });
});

describe("Testing productListController", () => {
  let req, res, mockProducts;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { params: { page: "2" } };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    mockProducts = [
      { _id: "1", name: "Product 1" },
      { _id: "2", name: "Product 2" },
    ];
  });

  it("should return products for specific page", async () => {
    // arrange
    productModel.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(mockProducts),
          }),
        }),
      }),
    });

    // act
    await productListController(req, res);

    // assert
    expect(productModel.find).toHaveBeenCalledWith({});
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      products: mockProducts,
    });
  });

  it("should handle default page when not provided", async () => {
    // arrange
    req.params = {};
    productModel.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(mockProducts),
          }),
        }),
      }),
    });

    // act
    await productListController(req, res);

    // assert
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should handle database errors", async () => {
    // arrange
    productModel.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            sort: jest.fn().mockRejectedValue(new Error("DB Error")),
          }),
        }),
      }),
    });

    // act
    await productListController(req, res);

    // assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error in per page controller", 
      error: expect.any(Error),
    });
  });
});

describe("Testing searchProductController", () => {
  let req, res, mockResults;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { params: { keyword: "laptop" } };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    mockResults = [
      { _id: "1", name: "Gaming Laptop", description: "High performance laptop" },
      { _id: "2", name: "Laptop Stand", description: "Adjustable laptop stand" },
    ];
  });

  it("should search products by keyword", async () => {
    // arrange
    productModel.find.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockResults),
    });

    // act
    await searchProductController(req, res);

    // assert
    expect(productModel.find).toHaveBeenCalledWith({
      $or: [
        { name: { $regex: "laptop", $options: "i" } },
        { description: { $regex: "laptop", $options: "i" } },
      ],
    });
    expect(res.json).toHaveBeenCalledWith(mockResults);
  });

  it("should handle database errors", async () => {
    // arrange
    productModel.find.mockReturnValue({
      select: jest.fn().mockRejectedValue(new Error("DB Error")),
    });

    // act
    await searchProductController(req, res);

    // assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error In Search Product API",
      error: expect.any(Error),
    });
  });

  it("should handle special characters in keyword", async () => {
    // arrange
    req.params.keyword = "test@#$%";
    productModel.find.mockReturnValue({
      select: jest.fn().mockResolvedValue([]),
    });

    // act
    await searchProductController(req, res);

    // assert
    expect(productModel.find).toHaveBeenCalledWith({
      $or: [
        { name: { $regex: "test@#$%", $options: "i" } },
        { description: { $regex: "test@#$%", $options: "i" } },
      ],
    });
  });
});

describe("Testing realtedProductController", () => {
  let req, res, mockProducts;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { params: { pid: "product123", cid: "category456" } };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    mockProducts = [
      { _id: "2", name: "Related Product 1" },
      { _id: "3", name: "Related Product 2" },
    ];
  });

  it("should return related products successfully", async () => {
    // arrange
    productModel.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockProducts),
        }),
      }),
    });

    // act
    await realtedProductController(req, res);

    // assert
    expect(productModel.find).toHaveBeenCalledWith({
      category: "category456",
      _id: { $ne: "product123" },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      products: mockProducts,
    });
  });

  it("should handle database errors", async () => {
    // arrange
    productModel.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          populate: jest.fn().mockRejectedValue(new Error("DB Error")),
        }),
      }),
    });

    // act
    await realtedProductController(req, res);

    // assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error while getting related product", 
      error: expect.any(Error),
    });
  });
});

describe("Testing productCategoryController", () => {
  let req, res, mockCategory, mockProducts;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { params: { slug: "electronics" } };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    mockCategory = { _id: "cat1", name: "Electronics", slug: "electronics" };
    mockProducts = [
      { _id: "1", name: "Laptop", category: "cat1" },
      { _id: "2", name: "Phone", category: "cat1" },
    ];
  });

  it("should return products by category successfully", async () => {
    // arrange
    categoryModel.findOne.mockResolvedValue(mockCategory);
    productModel.find.mockReturnValue({
      populate: jest.fn().mockResolvedValue(mockProducts),
    });

    // act
    await productCategoryController(req, res);

    // assert
    expect(categoryModel.findOne).toHaveBeenCalledWith({ slug: "electronics" });
    expect(productModel.find).toHaveBeenCalledWith({ category: mockCategory });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      category: mockCategory,
      products: mockProducts,
    });
  });

  it("should handle category not found", async () => {
    // arrange
    categoryModel.findOne.mockResolvedValue(null);
    productModel.find.mockReturnValue({
      populate: jest.fn().mockResolvedValue([]),
    });

    // act
    await productCategoryController(req, res);

    // assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      category: null,
      products: [],
    });
  });

  it("should handle database errors", async () => {
    // arrange
    categoryModel.findOne.mockRejectedValue(new Error("DB Error"));

    // act
    await productCategoryController(req, res);

    // assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      error: expect.any(Error),
      message: "Error While Getting products",
    });
  });
});
