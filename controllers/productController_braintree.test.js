// Note: these test cases are genereated with the help of AI
import braintree from "braintree";
import {
  braintreeTokenController,
  brainTreePaymentController,
} from "../controllers/productController.js";
import orderModel from "../models/orderModel.js";

jest.mock("../models/orderModel.js", () => ({
  __esModule: true,
  default: jest.fn(() => ({ save: jest.fn() })),
}));

jest.mock("braintree", () => {
  const BraintreeGateway = jest.fn(() => ({
    clientToken: { generate: jest.fn() },
    transaction: { sale: jest.fn() },
  }));
  return {
    __esModule: true,
    default: {
      BraintreeGateway,
      Environment: { Sandbox: "Sandbox" },
    },
  };
});

jest.mock("dotenv", () => ({
  __esModule: true,
  default: { config: jest.fn() },
  config: jest.fn(),
}));

const makeRes = () => ({
  status: jest.fn().mockReturnThis(),
  send: jest.fn(),
  json: jest.fn(),
});

describe("testing braintreeTokenController", () => {
  let gateway;
  let logSpy;

  beforeAll(() => {
    gateway = braintree.BraintreeGateway.mock.results[0]?.value;
    if (!gateway) {
      gateway = new braintree.BraintreeGateway({});
    }
  });

  beforeEach(() => {
    gateway.clientToken.generate.mockReset();
    gateway.transaction.sale.mockReset();
  });

  it("client token is successfully generated", async () => {
    // arrange
    const req = {};
    const res = makeRes();

    gateway.clientToken.generate.mockImplementation((opts, cb) => {
      cb(null, { clientToken: "123" });
    });

    // act
    await braintreeTokenController(req, res);

    // assert
    expect(gateway.clientToken.generate).toHaveBeenCalledWith(
      {},
      expect.any(Function)
    );
    expect(res.send).toHaveBeenCalledWith({ clientToken: "123" });
  });

  it("returns 500 when token generation fails", async () => {
    // arrange
    const req = {};
    const res = makeRes();

    gateway.clientToken.generate.mockImplementation((opts, cb) => {
      cb(new Error("fail"), null);
    });

    // act
    await braintreeTokenController(req, res);

    // assert
    expect(gateway.clientToken.generate).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(expect.any(Error));
  });

  it("returns 500 with message when generate throws synchronously (outer catch)", async () => {
    // arrange
    const req = {};
    const res = makeRes();
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    gateway.clientToken.generate.mockImplementation(() => {
      throw new Error("sync boom");
    });

    // act
    await braintreeTokenController(req, res);

    // assert
    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(logSpy.mock.calls[0][0].message).toBe("sync boom");
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      error: "Unexpected error generating client token",
    });
    logSpy.mockRestore();
  });
});

describe("testing brainTreePaymentController", () => {
  let gateway;

  beforeAll(() => {
    gateway = braintree.BraintreeGateway.mock.results[0]?.value;
    if (!gateway) gateway = new braintree.BraintreeGateway({});
  });

  beforeEach(() => {
    jest.clearAllMocks();
    gateway.clientToken.generate.mockReset();
    gateway.transaction.sale.mockReset();
  });

  const makeReq = (overrides = {}) => ({
    body: { nonce: "fake-nonce", cart: [] },
    user: { _id: "user-1" },
    ...overrides,
  });

  const makeRes = () => ({
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
    json: jest.fn(),
  });

  it("Calls braintree sale with correct summed total for a filled cart with numeric prices", async () => {
    // arrange
    const req = makeReq({
      body: {
        nonce: "abc123",
        cart: [{ price: 10 }, { price: 15 }],
      },
    });
    const res = makeRes();
    gateway.transaction.sale.mockImplementation((payload, cb) => {
      cb(null, { id: "txn-1", success: true });
    });
    const saveMock = jest.fn();
    orderModel.mockReturnValueOnce({ save: saveMock });

    // act
    await brainTreePaymentController(req, res);

    // assert
    const saleArgs = gateway.transaction.sale.mock.calls[0][0];
    expect(saleArgs).toMatchObject({
      amount: 25,
      paymentMethodNonce: "abc123",
      options: { submitForSettlement: true },
    });
  });

  it("Correct orderModel object is saved for a filled cart with numeric prices", async () => {
    // arrange
    const req = makeReq({
      body: {
        nonce: "abc123",
        cart: [{ price: 10 }, { price: 15 }],
      },
    });
    const res = makeRes();
    gateway.transaction.sale.mockImplementation((payload, cb) => {
      cb(null, { id: "txn-1", success: true });
    });
    const saveMock = jest.fn();
    orderModel.mockReturnValueOnce({ save: saveMock });

    // act
    await brainTreePaymentController(req, res);

    // assert
    expect(orderModel).toHaveBeenCalledWith({
      products: req.body.cart,
      payment: { id: "txn-1", success: true },
      buyer: "user-1",
    });
    expect(res.json).toHaveBeenCalledWith({ ok: true });
  });

  it("Calls braintree sale with correct summed total for a filled cart with numeric prices", async () => {
    // arrange
    const req = makeReq({
      body: {
        nonce: "abc123",
        cart: [{ price: "10" }, { price: "15" }],
      },
    });
    const res = makeRes();
    gateway.transaction.sale.mockImplementation((payload, cb) => {
      cb(null, { id: "txn-1", success: true });
    });
    const saveMock = jest.fn();
    orderModel.mockReturnValueOnce({ save: saveMock });

    // act
    await brainTreePaymentController(req, res);

    // assert
    const saleArgs = gateway.transaction.sale.mock.calls[0][0];
    expect(saleArgs).toMatchObject({
      amount: 25,
      paymentMethodNonce: "abc123",
      options: { submitForSettlement: true },
    });
  });

  it("Correct orderModel object is saved for a filled cart with numeric prices", async () => {
    // arrange
    const req = makeReq({
      body: {
        nonce: "abc123",
        cart: [{ price: "10" }, { price: "15" }],
      },
    });
    const res = makeRes();
    gateway.transaction.sale.mockImplementation((payload, cb) => {
      cb(null, { id: "txn-1", success: true });
    });
    const saveMock = jest.fn();
    orderModel.mockReturnValueOnce({ save: saveMock });

    // act
    await brainTreePaymentController(req, res);

    // assert
    expect(orderModel).toHaveBeenCalledWith({
      products: req.body.cart,
      payment: { id: "txn-1", success: true },
      buyer: "user-1",
    });
    expect(res.json).toHaveBeenCalledWith({ ok: true });
  });

  it("returns 500 when braintree sale callback gets an error (result is null)", async () => {
    // arrange
    const req = makeReq({
      body: {
        nonce: "abc123",
        cart: [{ price: 5 }],
      },
    });
    const res = makeRes();

    const err = new Error("gateway failed");
    gateway.transaction.sale.mockImplementation((payload, cb) => {
      cb(err, null);
    });

    // act
    await brainTreePaymentController(req, res);

    // assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(err);
  });

  it("outer catch: logs and does NOT send a response when sale throws synchronously", async () => {
    // arrange
    const req = makeReq({
      body: { nonce: "boom", cart: [{ price: 1 }] },
    });
    const res = makeRes();
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    gateway.transaction.sale.mockImplementation(() => {
      throw new Error("sync throw inside sale");
    });

    // act
    await brainTreePaymentController(req, res);

    // assert
    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(String(logSpy.mock.calls[0][0])).toMatch(/sync throw inside sale/);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      error: "Unexpected error during payment",
    });
    logSpy.mockRestore();
  });
});
