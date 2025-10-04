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

        describe("Given a database error occurs", () => {
            it("When a user tries to register, Then a 500 error should be returned", async () => {
                // Given
                req.body = { name: "John Doe", email: "john@example.com", password: "password123", phone: "1234567890", address: "123 Main St", answer: "Test" };
                const dbError = new Error("Database connection failed");
                userModel.findOne.mockRejectedValue(dbError);

                // When
                await registerController(req, res);

                // Then
                expect(res.status).toHaveBeenCalledWith(500);
                expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ success: false, message: "Error registering user" }));
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

        describe("Given a user provides an incorrect password", () => {
            it("When they try to log in, Then an 'Invalid Password' error should be returned", async () => {
                // Given
                const user = { _id: "userId123", password: "hashedPassword123" };
                req.body = { email: "john@example.com", password: "wrongPassword" };
                userModel.findOne.mockResolvedValue(user);
                comparePassword.mockResolvedValue(false);

                // When
                await loginController(req, res);

                // Then
                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.send).toHaveBeenCalledWith({ success: false, message: "Invalid Password" });
            });
        });

        describe("Given a request is missing email or password", () => {
            it("When they try to log in, Then a 404 error should be returned", async () => {
                // Given
                req.body = { email: "john@example.com" }; // Missing password

                // When
                await loginController(req, res);

                // Then
                expect(res.status).toHaveBeenCalledWith(404);
                expect(res.send).toHaveBeenCalledWith({ success: false, message: "Invalid email or password" });
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


        describe("Given a user provides an incorrect email or answer", () => {
            it("When they try to reset the password, Then a 404 error should be returned", async () => {
                // Given
                req.body = { email: "wrong@example.com", answer: "Wrong", newPassword: "newPassword123" };
                userModel.findOne.mockResolvedValue(null);

                // When
                await forgotPasswordController(req, res);

                // Then
                expect(res.status).toHaveBeenCalledWith(404);
                expect(res.send).toHaveBeenCalledWith({ success: false, message: "Wrong Email Or Answer" });
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

        describe("Given a user provides a password shorter than 6 characters", () => {
            it("When they update their profile, Then a 400 error should be returned", async () => {
                // Given
                req.body = { password: "123" };
                userModel.findById.mockResolvedValue({ _id: "userId123" });

                // When
                await updateProfileController(req, res);

                // Then
                expect(res.status).toHaveBeenCalledWith(400);
                expect(res.send).toHaveBeenCalledWith({
                    success: false,
                    message: "Password is required and must be at least 6 characters long",
                });
            });
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

        describe("Given a database error occurs", () => {
            it("When fetching orders, Then a 500 error should be returned", async () => {
                // Given
                const dbError = new Error("Database connection failed");
                const failingQuery = {
                    populate: jest.fn().mockRejectedValue(dbError),
                };
                orderModel.find.mockReturnValue({
                    populate: jest.fn().mockReturnValue(failingQuery),
                });
                
                // When
                await getOrdersController(req, res);

                // Then
                expect(res.status).toHaveBeenCalledWith(500);
                expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ message: "Error while getting orders" }));
            });
        });
    });

    describe("getAllOrdersController", () => {
        describe("Given an admin is logged in", () => {
            it("When they fetch all orders, Then a list of all orders should be returned", async () => {
                // Given
                const mockOrders = [{ _id: "order1" }, { _id: "order2" }];
                const query = { populate: jest.fn().mockReturnThis(), sort: jest.fn().mockResolvedValue(mockOrders) };
                orderModel.find.mockReturnValue(query);

                // When
                await getAllOrdersController(req, res);

                // Then
                expect(orderModel.find).toHaveBeenCalledWith({});
                expect(res.json).toHaveBeenCalledWith(mockOrders);
            });
        });
    });

    describe("orderStatusController", () => {
        describe("Given an admin provides a valid order ID and status", () => {
            it("When they update the order status, Then the updated order should be returned", async () => {
                // Given
                req.params.orderId = "orderId123";
                req.body.status = "Shipped";
                const updatedOrder = { _id: "orderId123", status: "Shipped" };
                orderModel.findByIdAndUpdate.mockResolvedValue(updatedOrder);

                // When
                await orderStatusController(req, res);

                // Then
                expect(orderModel.findByIdAndUpdate).toHaveBeenCalledWith("orderId123", { status: "Shipped" }, { new: true });
                expect(res.json).toHaveBeenCalledWith(updatedOrder);
            });
        });
    });

    describe("testController", () => {
        describe("Given a request to the test route", () => {
            it("When the controller is called, Then it should send a success message", () => {
                // When
                testController(req, res);

                // Then
                expect(res.send).toHaveBeenCalledWith("Protected Routes");
            });
        });
    });
});
