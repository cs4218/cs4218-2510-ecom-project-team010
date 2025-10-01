import fs from "fs";
import slugify from "slugify";
import productModel from "../models/productModel.js";

// Note: these test cases are genereated with the help of AI

// arrange
jest.mock("../models/productModel.js", () => {
  const productModelMock = jest.fn(() => ({ photo: {}, save: jest.fn() }));
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
jest.mock("../models/categoryModel.js", () => ({
  __esModule: true,
  default: jest.fn(),
}));
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
  //arrange
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
