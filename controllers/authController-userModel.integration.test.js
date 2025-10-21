import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import authRoutes from "../routes/authRoute.js";
import userModel from "../models/userModel.js";

// Setup Express app
const app = express();
app.use(express.json());
app.use("/api/v1/auth", authRoutes);

let mongoServer;

// Connect to a mock database before all tests
beforeAll(async () => {
  process.env.JWT_SECRET = "a-secret-key-for-testing";
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

// Clear data after each test
afterEach(async () => {
  await userModel.deleteMany({});
});

// Disconnect after all tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Test Suite for Auth Controller
describe("Auth Controller", () => {
  // Test cases for User Registration
  describe("POST /api/v1/auth/register", () => {
    it("should register a new user successfully", async () => {
      // Given: No user exists with the provided email.
      const newUser = {
        name: "John Doe",
        email: "john.doe@example.com",
        password: "password123",
        phone: "1234567890",
        address: "123 Main St",
        answer: "Test",
      };

      // When: A POST request is made to the registration endpoint with user data.
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(newUser);

      // Then: The API should return a 201 status, success message, and the user object.
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("User registered successfully"); //
    });

    it("should return an error if the user already exists", async () => {
      // Given: A user with the email 'jane.doe@example.com' already exists in the database.
      const existingUser = {
        name: "Jane Doe",
        email: "jane.doe@example.com",
        password: "password123",
        phone: "1234567890",
        address: "123 Main St",
        answer: "Test",
      };
      await new userModel(existingUser).save();

      // When: A POST request is made to register with the same email.
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(existingUser);

      // Then: The API should return a 409 status and an error message indicating the user exists.
      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("User with that email already exists, please login"); //
    });
  });

  // Test cases for User Login
  describe("POST /api/v1/auth/login", () => {
    it("should log in an existing user successfully", async () => {
      // Given: A registered user exists in the database.
      const userCredentials = {
        email: "test@example.com",
        password: "password123",
      };
      await request(app).post("/api/v1/auth/register").send({
        name: "Test User",
        phone: "1112223333",
        address: "456 Test Ave",
        answer: "LoginTest",
        ...userCredentials,
      });

      // When: A POST request is made to the login endpoint with correct credentials.
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send(userCredentials);

      // Then: The API should return a 200 status, success message, and a JWT token.
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Login successful"); //
      expect(response.body.token).toBeDefined();
    });

    it("should return an error for an incorrect password", async () => {
        // Given: A registered user exists in the database.
        await request(app).post("/api/v1/auth/register").send({
            name: "Test User",
            email: "test@example.com",
            password: "password123",
            phone: "1112223333",
            address: "456 Test Ave",
            answer: "LoginTest"
        });

        // When: A POST request is made to the login endpoint with an incorrect password.
        const response = await request(app)
            .post("/api/v1/auth/login")
            .send({ email: "test@example.com", password: "wrongpassword" });

        // Then: The API should return a 401 status and an "Invalid Password" error message.
        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Invalid Password"); //
    });
  });

  // Test cases for Password Reset
  describe("POST /api/v1/auth/forgot-password", () => {
    it("should reset the user's password successfully", async () => {
      // Given: A user exists with a known email and security answer.
      await request(app).post("/api/v1/auth/register").send({
        name: "Reset User",
        email: "reset@example.com",
        password: "oldPassword",
        phone: "4445556666",
        address: "789 Reset Rd",
        answer: "Secret",
      });

      // When: A POST request is made to the forgot-password endpoint with the correct email, answer, and a new password.
      const response = await request(app)
        .post("/api/v1/auth/forgot-password")
        .send({
          email: "reset@example.com",
          answer: "Secret",
          newPassword: "newPassword",
        });

      // Then: The API should return a 200 status and a success message.
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Password Reset Successfully"); //
    });

    it("should return an error for a wrong security answer", async () => {
        // Given: A user exists with a known email and security answer.
        await request(app).post("/api/v1/auth/register").send({
            name: "Reset User",
            email: "reset@example.com",
            password: "oldPassword",
            phone: "4445556666",
            address: "789 Reset Rd",
            answer: "Secret"
        });

        // When: A POST request is made with the correct email but a wrong security answer.
        const response = await request(app)
            .post("/api/v1/auth/forgot-password")
            .send({ email: "reset@example.com", answer: "WrongAnswer", newPassword: "newPassword" });

        // Then: The API should return a 404 status and an error message.
        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Wrong Email Or Answer"); //
    });
  });
});