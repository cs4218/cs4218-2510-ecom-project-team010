import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import { requireSignIn, isAdmin } from './authMiddleware.js'; // Assuming the middleware is in authMiddleware.js

// Mock the userModel
jest.mock('../models/userModel.js');

// Mock the jsonwebtoken library
jest.mock('jsonwebtoken');

// Mock console.log to prevent logs during tests and to spy on it
global.console = { log: jest.fn(), error: jest.fn() };

describe('Auth Middleware', () => {

    let mockRequest;
    let mockResponse;
    let nextFunction;

    // Reset mocks before each test
    beforeEach(() => {
        mockRequest = {
            headers: {},
            user: null,
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
        nextFunction = jest.fn();
    });

    describe('requireSignIn', () => {

        it('should call next() and attach user to req if token is valid', () => {
            const token = 'valid.token.string';
            const decodedUser = { _id: 'userId123', email: 'test@example.com' };

            mockRequest.headers.authorization = token;

            // Mock JWT.verify to return the decoded user
            jwt.verify.mockReturnValue(decodedUser);

            requireSignIn(mockRequest, mockResponse, nextFunction);

            // Expect req.user to be set
            expect(mockRequest.user).toEqual(decodedUser);
            // Expect next() to have been called
            expect(nextFunction).toHaveBeenCalled();
            // Ensure no response was sent
            expect(mockResponse.status).not.toHaveBeenCalled();
        });

        it('should log an error if the token is invalid or missing', () => {
            const error = new Error('Invalid token');
            mockRequest.headers.authorization = 'invalid.token';

            // Mock JWT.verify to throw an error
            jwt.verify.mockImplementation(() => {
                throw error;
            });

            requireSignIn(mockRequest, mockResponse, nextFunction);

            // Expect the error to be logged
            expect(console.log).toHaveBeenCalledWith(error);
            // Expect next() not to have been called
            expect(nextFunction).not.toHaveBeenCalled();
            // The original function doesn't send a response on error, so we test for that behavior.
            expect(mockResponse.send).not.toHaveBeenCalled();
        });
    });

    describe('isAdmin', () => {

        it('should call next() if the user has an admin role (role === 1)', async () => {
            // Setup the request with a user from the previous middleware
            mockRequest.user = { _id: 'adminUserId' };

            const mockAdminUser = { _id: 'adminUserId', name: 'Admin', role: 1 };
            userModel.findById.mockResolvedValue(mockAdminUser);

            await isAdmin(mockRequest, mockResponse, nextFunction);

            // Expect findById to be called with the correct user id
            expect(userModel.findById).toHaveBeenCalledWith('adminUserId');
            // Expect next() to have been called
            expect(nextFunction).toHaveBeenCalled();
            // Ensure no response was sent
            expect(mockResponse.send).not.toHaveBeenCalled();
        });

        it('should send a 401 Unauthorized error if the user is not an admin', async () => {
            // Setup the request with a user from the previous middleware
            mockRequest.user = { _id: 'nonAdminUserId' };

            const mockUser = { _id: 'nonAdminUserId', name: 'User', role: 0 };
            userModel.findById.mockResolvedValue(mockUser);

            await isAdmin(mockRequest, mockResponse, nextFunction);

            // Expect a 401 status
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            // Expect the correct unauthorized message
            expect(mockResponse.send).toHaveBeenCalledWith({
                success: false,
                message: 'UnAuthorized Access',
            });
            // Expect next() not to be called
            expect(nextFunction).not.toHaveBeenCalled();
        });

        it('should handle database errors and send a 401 response', async () => {
            const dbError = new Error('Database connection failed');
            mockRequest.user = { _id: 'anyUserId' };

            // Mock findById to reject with an error
            userModel.findById.mockRejectedValue(dbError);

            await isAdmin(mockRequest, mockResponse, nextFunction);

            // Expect the error to be logged
            expect(console.log).toHaveBeenCalledWith(dbError);
            // Expect a 401 status
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            // Expect the correct error message in the response
            expect(mockResponse.send).toHaveBeenCalledWith({
                success: false,
                error: dbError,
                message: 'Error in admin middleware',
            });
            // Expect next() not to be called
            expect(nextFunction).not.toHaveBeenCalled();
        });

        it('should send a 401 Unauthorized error if user is not found', async () => {
            mockRequest.user = { _id: 'notFoundUserId' };

            // Mock findById to return null (user not found)
            userModel.findById.mockResolvedValue(null);

            await isAdmin(mockRequest, mockResponse, nextFunction);

             // The original code will throw a TypeError: Cannot read properties of null (reading 'role')
             // We test that this error is caught and handled.
            expect(console.log).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: "Error in admin middleware",
                })
            );
            expect(nextFunction).not.toHaveBeenCalled();
        });
    });
});
