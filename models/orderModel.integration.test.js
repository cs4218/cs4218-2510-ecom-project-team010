import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import orderModel from "../models/orderModel.js"; //
import userModel from "../models/userModel.js"; //
import productModel from "../models/productModel.js"; //

let mongoServer;

// Setup: Connect to a new in-memory database before all tests run
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

// Teardown: Clear all data after each test to ensure isolation
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Teardown: Disconnect from the in-memory database after all tests have run
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Test Suite for the Order Model
describe("Order Model Integration Test", () => {

  it("should create and save an order successfully", async () => {
    // Given: A user and a product with all required fields exist in the database.
    const user = await new userModel({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
      phone: "1234567890",
      address: "123 Test St",
      answer: "TestAnswer", // Added required field
    }).save();

    const product = await new productModel({
      name: "Test Product",
      slug: "test-product",
      description: "A product for testing.",
      price: 100,
      category: new mongoose.Types.ObjectId(),
      quantity: 10,
    }).save();

    const orderData = {
      products: [product._id],
      payment: { transactionId: "txn_123" },
      buyer: user._id,
    };

    // When: A new order is created with valid data and saved.
    const newOrder = new orderModel(orderData);
    const savedOrder = await newOrder.save();

    // Then: The saved order should have all the correct properties and default values.
    expect(savedOrder._id).toBeDefined();
    expect(savedOrder.buyer.toString()).toEqual(user._id.toString());
    expect(savedOrder.products).toHaveLength(1);
    expect(savedOrder.products[0].toString()).toEqual(product._id.toString());
    expect(savedOrder.payment.transactionId).toBe("txn_123");
    expect(savedOrder.status).toBe("Not Process"); //
  });

  it("should fail to create an order with an invalid status", async () => {
    // Given: A user exists, and we have order data with an invalid status.
    const user = await new userModel({
        name: "User",
        email: "u@u.com",
        password: "p",
        phone: "123",
        address: "123 St",
        answer: "Answer" // Added required field
    }).save();

    const orderData = {
      products: [],
      payment: {},
      buyer: user._id,
      status: "InvalidStatus", // This status is not in the schema's enum
    };
    let error;

    // When: We attempt to save an order with the invalid status.
    try {
      const newOrder = new orderModel(orderData);
      await newOrder.save();
    } catch (e) {
      error = e;
    }

    // Then: A Mongoose validation error should be thrown for the 'status' path.
    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.status).toBeDefined();
  });

  it("should fail to create an order without a buyer", async () => {
    // Given: Order data is missing the required 'buyer' field.
    const orderData = {
      products: [new mongoose.Types.ObjectId()],
      payment: {},
      // 'buyer' field is intentionally omitted
    };

    // When & Then: We expect the save operation to be rejected with a Mongoose ValidationError.
    const newOrder = new orderModel(orderData);
    await expect(newOrder.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });
});