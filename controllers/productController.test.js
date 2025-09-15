import fs from "fs";
import slugify from "slugify";

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

import productModel from "../models/productModel.js";

describe("testing createProductController function", () => {
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

  it("500 if no name field", async () => {
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
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      error: "Name is Required",
    });
  });

  it("500 if photo > 1MB", async () => {
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
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      error: "photo is Required and should be less then 1mb",
    });
  });

  it("500 if no description field", async () => {
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

    await createProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      error: "Description is Required",
    });
  });

  it("500 if no price field", async () => {
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

    await createProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      error: "Price is Required",
    });
  });

  it("500 if no category field", async () => {
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

    await createProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      error: "Category is Required",
    });
  });

  it("500 if no quantity field", async () => {
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

    await createProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      error: "Quantity is Required",
    });
  });

  it("201 if product is saved", async () => {
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

    await createProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    const payload = res.send.mock.calls[0][0];

    expect(payload).toEqual(
      expect.objectContaining({
        success: true,
        message: "Product Created Successfully",
        products: expect.any(Object),
      })
    );

    expect(slugify).toHaveBeenCalledWith("Nintendo Switch");
    expect(fs.readFileSync).toHaveBeenCalledWith("/tmp/p.jpg");
  });

    it("500 if files parameter not in req", async () => {
        //silence console as intentionally ommiting the files parameter
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        const req = {
        fields: {
            name: "Nintendo Switch",
            description: "A fun game to enjoy with friends.",
            price: 2500,
            category: "Devices",
            quantity: "5",
            shipping: true,
        },
        };
        const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

        await createProductController(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        const payload = res.send.mock.calls[0][0];

        expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
            success: false,
            message: 'Error in creating product',
        })
    );
    logSpy.mockRestore();
    });


  
});



describe("testing updateProductController function", () => {
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

  it("500 if no name field", async () => {
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

    await updateProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      error: "Name is Required",
    });
  });

  it("500 if photo > 1MB", async () => {
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

    await updateProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      error: "photo is Required and should be less then 1mb",
    });
  });

  it("500 if no description field", async () => {
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

   await updateProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      error: "Description is Required",
    });
  });

  it("500 if no price field", async () => {
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

    await updateProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      error: "Price is Required",
    });
  });

  it("500 if no category field", async () => {
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

    await updateProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      error: "Category is Required",
    });
  });

  it("500 if no quantity field", async () => {
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

    await updateProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      error: "Quantity is Required",
    });
  });

  
  it("201 if product is updated successfully", async() => {
    const req = {
      params : {pid: '123'},
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

    await updateProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    const payload = res.send.mock.calls[0][0];

    expect(payload).toEqual(
      expect.objectContaining({
        success: true,
        message: "Product Updated Successfully",
        products: expect.any(Object),
      })
    );

    expect(slugify).toHaveBeenCalledWith("Nintendo Switch");
    expect(fs.readFileSync).toHaveBeenCalledWith("/tmp/p.jpg");

    expect(productModel.findByIdAndUpdate).toHaveBeenCalledWith('123',
       expect.objectContaining({slug: 'mock-slug'}), 
       {new: true}
    );
  });

 
  it("500 if product has no pid and is not updated successfully", async() => {
    
    //silence console as intentionally ommiting the pid parameter
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

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

    await updateProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.any(Object),
        message: "Error in Update product",
      })
    );

    logSpy.mockRestore();

  });
  
});