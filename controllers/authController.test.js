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
    getAllUsersController,
} from "./authController.js"; // Assuming the controller is in authController.js

// Mock dependencies
jest.mock("../models/userModel.js");
jest.mock("../models/orderModel.js");
jest.mock("../helpers/authHelper.js");
jest.mock("jsonwebtoken");

// Mock console.log to prevent logs during tests
global.console = { log: jest.fn(), error: jest.fn() };

describe("Auth Controllers", () => {
    let req, res;

    // Reset mocks and setup mock req/res objects before each test
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
        it("should register a new user successfully", async () => {
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

            await registerController(req, res);

            expect(userModel.findOne).toHaveBeenCalledWith({ email: "john@example.com" });
            expect(hashPassword).toHaveBeenCalledWith("password123");
            expect(saveMock).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    message: "User Registered Successfully",
                })
            );
        });

        it("should return an error if a required field is missing", async () => {
            req.body = { email: "john@example.com" }; // Missing name, password, etc.
            await registerController(req, res);
            expect(res.send).toHaveBeenCalledWith({ error: "Name is Required" });
        });

        it("should return an error if user already exists", async () => {
            req.body = { name: "Jane Doe", email: "jane@example.com", password: "password123", phone: "1234567890", address: "123 Main St", answer: "Test" };
            userModel.findOne.mockResolvedValue({ email: "jane@example.com" });

            await registerController(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({
                success: false,
                message: "Already Register please login",
            });
        });

        it("should handle server errors during registration", async () => {
            req.body = { name: "Jane Doe", email: "jane@example.com", password: "password123", phone: "1234567890", address: "123 Main St", answer: "Test" };
            const error = new Error("Database error");
            userModel.findOne.mockRejectedValue(error);

            await registerController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({
                success: false,
                message: "Error in Registration",
                error,
            });
        });
    });

    describe("loginController", () => {
        it("should login an existing user successfully", async () => {
            const user = { _id: "userId123", name: "John Doe", email: "john@example.com", password: "hashedPassword123", phone: "1234567890", address: "123 Main St", role: 0 };
            req.body = { email: "john@example.com", password: "password123" };

            userModel.findOne.mockResolvedValue(user);
            comparePassword.mockResolvedValue(true);
            JWT.sign.mockReturnValue("fake-jwt-token");

            await loginController(req, res);

            expect(userModel.findOne).toHaveBeenCalledWith({ email: "john@example.com" });
            expect(comparePassword).toHaveBeenCalledWith("password123", "hashedPassword123");
            expect(JWT.sign).toHaveBeenCalledWith({ _id: "userId123" }, undefined, { expiresIn: "7d" });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ success: true, token: "fake-jwt-token" }));
        });

        it("should return 404 if user is not found", async () => {
            req.body = { email: "nonexistent@example.com", password: "password123" };
            userModel.findOne.mockResolvedValue(null);

            await loginController(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.send).toHaveBeenCalledWith({ success: false, message: "Email is not registerd" });
        });

        it("should return error for invalid password", async () => {
            const user = { _id: "userId123", password: "hashedPassword123" };
            req.body = { email: "john@example.com", password: "wrongPassword" };

            userModel.findOne.mockResolvedValue(user);
            comparePassword.mockResolvedValue(false);

            await loginController(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({ success: false, message: "Invalid Password" });
        });
    });

    describe("forgotPasswordController", () => {
        it("should reset password successfully", async () => {
            req.body = { email: "john@example.com", answer: "Test", newPassword: "newPassword123" };
            const user = { _id: "userId123" };
            userModel.findOne.mockResolvedValue(user);
            hashPassword.mockResolvedValue("newHashedPassword");
            userModel.findByIdAndUpdate.mockResolvedValue({});

            await forgotPasswordController(req, res);

            expect(userModel.findOne).toHaveBeenCalledWith({ email: "john@example.com", answer: "Test" });
            expect(hashPassword).toHaveBeenCalledWith("newPassword123");
            expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith("userId123", { password: "newHashedPassword" });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({ success: true, message: "Password Reset Successfully" });
        });

        it("should return 404 for wrong email or answer", async () => {
            req.body = { email: "john@example.com", answer: "WrongAnswer", newPassword: "newPassword123" };
            userModel.findOne.mockResolvedValue(null);

            await forgotPasswordController(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.send).toHaveBeenCalledWith({ success: false, message: "Wrong Email Or Answer" });
        });
    });

    describe("updateProfileController", () => {
        it("should update profile successfully", async () => {
            req.body = { name: "Johnathan Doe", phone: "0987654321" };
            const existingUser = { _id: "userId123", name: "John Doe", phone: "1234567890", address: "123 Main St", password: "oldHashedPassword" };

            userModel.findById.mockResolvedValue(existingUser);
            userModel.findByIdAndUpdate.mockResolvedValue({ ...existingUser, ...req.body });

            await updateProfileController(req, res);

            expect(userModel.findById).toHaveBeenCalledWith("userId123");
            expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith("userId123", expect.any(Object), { new: true });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ success: true, message: "Profile Updated SUccessfully" }));
        });
    });

    describe("getAllUsersController", () => {
        it("should get all users successfully", async () => {
            const mockUsers = [
                { _id: "user1", name: "John Doe", email: "john@example.com", phone: "1234567890", role: 0, createdAt: "2024-01-15T10:30:00.000Z" },
                { _id: "user2", name: "Jane Smith", email: "jane@example.com", phone: "0987654321", role: 1, createdAt: "2024-01-10T08:20:00.000Z" }
            ];

            const sortMock = jest.fn().mockResolvedValue(mockUsers);
            const selectMock = jest.fn().mockReturnValue({ sort: sortMock });
            userModel.find.mockReturnValue({ select: selectMock });

            await getAllUsersController(req, res);

            expect(userModel.find).toHaveBeenCalledWith({});
            expect(selectMock).toHaveBeenCalledWith("-password -answer");
            expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({
                success: true,
                message: "All users retrieved successfully",
                users: mockUsers,
            });
        });

        it("should return empty array when no users exist", async () => {
            const sortMock = jest.fn().mockResolvedValue([]);
            const selectMock = jest.fn().mockReturnValue({ sort: sortMock });
            userModel.find.mockReturnValue({ select: selectMock });

            await getAllUsersController(req, res);

            expect(userModel.find).toHaveBeenCalledWith({});
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({
                success: true,
                message: "All users retrieved successfully",
                users: [],
            });
        });

        it("should exclude password and answer fields from response", async () => {
            const mockUsers = [
                { _id: "user1", name: "John Doe", email: "john@example.com" }
            ];

            const sortMock = jest.fn().mockResolvedValue(mockUsers);
            const selectMock = jest.fn().mockReturnValue({ sort: sortMock });
            userModel.find.mockReturnValue({ select: selectMock });

            await getAllUsersController(req, res);

            expect(selectMock).toHaveBeenCalledWith("-password -answer");
        });

        it("should sort users by createdAt in descending order", async () => {
            const mockUsers = [
                { _id: "user1", name: "Recent User", createdAt: "2024-01-20T10:00:00.000Z" },
                { _id: "user2", name: "Older User", createdAt: "2024-01-10T10:00:00.000Z" }
            ];

            const sortMock = jest.fn().mockResolvedValue(mockUsers);
            const selectMock = jest.fn().mockReturnValue({ sort: sortMock });
            userModel.find.mockReturnValue({ select: selectMock });

            await getAllUsersController(req, res);

            expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
        });

        it("should handle database errors", async () => {
            const error = new Error("Database connection failed");
            const selectMock = jest.fn().mockReturnValue({
                sort: jest.fn().mockRejectedValue(error)
            });
            userModel.find.mockReturnValue({ select: selectMock });

            await getAllUsersController(req, res);

            expect(console.error).toHaveBeenCalledWith(error);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({
                success: false,
                message: "Error in getting users",
                error,
            });
        });

        it("should handle errors during query execution", async () => {
            const error = new Error("Query failed");
            userModel.find.mockImplementation(() => {
                throw error;
            });

            await getAllUsersController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({
                success: false,
                message: "Error in getting users",
                error,
            });
        });
    });

    describe("getOrdersController", () => {
        it("should get user orders successfully", async () => {
            const mockOrders = [{ _id: "order1" }, { _id: "order2" }];

            // Mock the chained Mongoose query to handle two separate .populate() calls
            // The first .populate() returns an object that has the second .populate()
            // The second .populate() returns the promise that resolves the data
            const finalQuery = { populate: jest.fn().mockResolvedValue(mockOrders) };
            const initialQuery = { populate: jest.fn().mockReturnValue(finalQuery) };
            orderModel.find.mockReturnValue(initialQuery);

            await getOrdersController(req, res);

            expect(orderModel.find).toHaveBeenCalledWith({ buyer: "userId123" });
            expect(initialQuery.populate).toHaveBeenCalledWith("products", "-photo");
            expect(finalQuery.populate).toHaveBeenCalledWith("buyer", "name");
            expect(res.json).toHaveBeenCalledWith(mockOrders);
        });

        it("should handle errors when fetching orders", async () => {
            const error = new Error("Database query failed");
            // Mock the chain to throw an error at the end
            orderModel.find.mockImplementation(() => ({
                populate: jest.fn().mockImplementation(() => ({
                    populate: jest.fn().mockRejectedValue(error)
                }))
            }));

            await getOrdersController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({
                success: false,
                message: "Error WHile Geting Orders",
                error,
            });
        });
    });

    describe("getAllOrdersController", () => {
        it("should get all orders for admin successfully", async () => {
            const mockOrders = [{ _id: "order1" }, { _id: "order2" }];
            const query = { populate: jest.fn().mockReturnThis(), sort: jest.fn().mockResolvedValue(mockOrders) };
            orderModel.find.mockReturnValue(query);

            await getAllOrdersController(req, res);

            expect(orderModel.find).toHaveBeenCalledWith({});
            expect(res.json).toHaveBeenCalledWith(mockOrders);
        });
    });

    describe("orderStatusController", () => {
        it("should update an order status successfully", async () => {
            req.params.orderId = "orderId123";
            req.body.status = "Shipped";
            const updatedOrder = { _id: "orderId123", status: "Shipped" };
            orderModel.findByIdAndUpdate.mockResolvedValue(updatedOrder);

            await orderStatusController(req, res);

            expect(orderModel.findByIdAndUpdate).toHaveBeenCalledWith("orderId123", { status: "Shipped" }, { new: true });
            expect(res.json).toHaveBeenCalledWith(updatedOrder);
        });
    });

    describe("testController", () => {
        it("should send a 'Protected Routes' message", () => {
            testController(req, res);
            expect(res.send).toHaveBeenCalledWith("Protected Routes");
        });
    });
});

