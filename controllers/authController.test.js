import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import { hashPassword, comparePassword } from "../helpers/authHelper.js";
import JWT from "jsonwebtoken";
import {
    registerController,
    loginController,
    forgotPasswordController,
    testController,
    updateProfileController,
    getOrdersController,
    getAllOrdersController,
    orderStatusController,
} from "./authController.js";

// Mock dependencies
jest.mock("../models/userModel.js");
jest.mock("../models/orderModel.js");
jest.mock("../helpers/authHelper.js");
jest.mock("jsonwebtoken");

// Mock console.log to prevent logs during tests
global.console = { log: jest.fn(), error: jest.fn() };

describe("Auth Controllers", () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            body: {},
            params: {},
            user: { _id: "userId123" },
        };
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
            json: jest.fn(),
        };
    });

    describe("registerController", () => {
        describe("Given a new user provides all required information", () => {
            it("When they register, Then a new user should be created", async () => {
                // Given
                req.body = {
                    name: "John Doe",
                    email: "john@example.com",
                    password: "password123",
                    phone: "1234567890",
                    address: "123 Main St",
                    answer: "Test",
                };
                userModel.findOne.mockResolvedValue(null);
                hashPassword.mockResolvedValue("hashedPassword123");
                const saveMock = jest.fn().mockResolvedValue({ _id: "newUser123", ...req.body });
                userModel.mockImplementation(() => ({ save: saveMock }));

                // When
                await registerController(req, res);

                // Then
                expect(userModel.findOne).toHaveBeenCalledWith({ email: "john@example.com" });
                expect(hashPassword).toHaveBeenCalledWith("password123");
                expect(saveMock).toHaveBeenCalled();
                expect(res.status).toHaveBeenCalledWith(201);
                expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
                    success: true,
                    message: "User registered successfully",
                }));
            });
        });

        describe("Given a user is missing a required field", () => {
            it("When they try to register, Then an error should be returned", async () => {
                // Given
                req.body = { email: "john@example.com" }; // Missing name, password, etc.

                // When
                await registerController(req, res);

                // Then
                expect(res.send).toHaveBeenCalledWith({ error: "Name is Required" });
            });
        });

        describe("Given a user with an existing email tries to register", () => {
            it("When they submit their information, Then an error should be returned", async () => {
                // Given
                req.body = { name: "Jane Doe", email: "jane@example.com", password: "password123", phone: "1234567890", address: "123 Main St", answer: "Test" };
                userModel.findOne.mockResolvedValue({ email: "jane@example.com" });

                // When
                await registerController(req, res);

                // Then
                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.send).toHaveBeenCalledWith({
                    success: false,
                    message: "User with that email already exists, please login",
                });
            });
        });
    });

    describe("loginController", () => {
        describe("Given a registered user provides correct credentials", () => {
            it("When they log in, Then a JWT token should be returned", async () => {
                // Given
                const user = { _id: "userId123", name: "John Doe", email: "john@example.com", password: "hashedPassword123", role: 0 };
                req.body = { email: "john@example.com", password: "password123" };
                userModel.findOne.mockResolvedValue(user);
                comparePassword.mockResolvedValue(true);
                JWT.sign.mockReturnValue("fake-jwt-token");

                // When
                await loginController(req, res);

                // Then
                expect(userModel.findOne).toHaveBeenCalledWith({ email: "john@example.com" });
                expect(comparePassword).toHaveBeenCalledWith("password123", "hashedPassword123");
                expect(JWT.sign).toHaveBeenCalledWith({ _id: "userId123" }, undefined, { expiresIn: "7d" });
                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ success: true, token: "fake-jwt-token" }));
            });
        });

        describe("Given a user provides an unregistered email", () => {
            it("When they try to log in, Then a 404 error should be returned", async () => {
                // Given
                req.body = { email: "nonexistent@example.com", password: "password123" };
                userModel.findOne.mockResolvedValue(null);

                // When
                await loginController(req, res);

                // Then
                expect(res.status).toHaveBeenCalledWith(404);
                expect(res.send).toHaveBeenCalledWith({ success: false, message: "Email is not registerd" });
            });
        });
    });

    describe("forgotPasswordController", () => {
        describe("Given a user provides the correct email, answer, and a new password", () => {
            it("When they reset their password, Then the password should be updated", async () => {
                // Given
                req.body = { email: "john@example.com", answer: "Test", newPassword: "newPassword123" };
                const user = { _id: "userId123" };
                userModel.findOne.mockResolvedValue(user);
                hashPassword.mockResolvedValue("newHashedPassword");
                userModel.findByIdAndUpdate.mockResolvedValue({});

                // When
                await forgotPasswordController(req, res);

                // Then
                expect(userModel.findOne).toHaveBeenCalledWith({ email: "john@example.com", answer: "Test" });
                expect(hashPassword).toHaveBeenCalledWith("newPassword123");
                expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith("userId123", { password: "newHashedPassword" });
                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.send).toHaveBeenCalledWith({ success: true, message: "Password Reset Successfully" });
            });
        });
    });

    describe("updateProfileController", () => {
        describe("Given a user is logged in and provides valid updates", () => {
            it("When they update their profile, Then the user information should be changed", async () => {
                // Given
                req.body = { name: "Johnathan Doe", phone: "0987654321" };
                const existingUser = { _id: "userId123", name: "John Doe", phone: "1234567890", address: "123 Main St", password: "oldHashedPassword" };
                userModel.findById.mockResolvedValue(existingUser);
                userModel.findByIdAndUpdate.mockResolvedValue({ ...existingUser, ...req.body });

                // When
                await updateProfileController(req, res);

                // Then
                expect(userModel.findById).toHaveBeenCalledWith("userId123");
                expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith("userId123", expect.any(Object), { new: true });
                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ success: true, message: "Profile updated successfully" }));
            });
        });
    });

    describe("getOrdersController", () => {
        describe("Given a user is logged in", () => {
            it("When they fetch their orders, Then a list of their orders should be returned", async () => {
                // Given
                const mockOrders = [{ _id: "order1" }, { _id: "order2" }];
                const finalQuery = { populate: jest.fn().mockResolvedValue(mockOrders) };
                const initialQuery = { populate: jest.fn().mockReturnValue(finalQuery) };
                orderModel.find.mockReturnValue(initialQuery);

                // When
                await getOrdersController(req, res);

                // Then
                expect(orderModel.find).toHaveBeenCalledWith({ buyer: "userId123" });
                expect(initialQuery.populate).toHaveBeenCalledWith("products", "-photo");
                expect(finalQuery.populate).toHaveBeenCalledWith("buyer", "name");
                expect(res.json).toHaveBeenCalledWith(mockOrders);
            });
        });
    });
});