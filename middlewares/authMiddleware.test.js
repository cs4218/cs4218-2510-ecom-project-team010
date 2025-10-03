import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import { requireSignIn, isAdmin } from './authMiddleware.js';

// Mock dependencies
jest.mock('../models/userModel.js');
jest.mock('jsonwebtoken');
global.console = { log: jest.fn(), error: jest.fn() };

describe('Auth Middleware', () => {

    let mockRequest;
    let mockResponse;
    let nextFunction;

    beforeEach(() => {
        mockRequest = { headers: {}, user: null };
        mockResponse = { status: jest.fn().mockReturnThis(), send: jest.fn() };
        nextFunction = jest.fn();
    });

    describe('Given a request requiring sign-in', () => {
        describe('When the authorization token is valid', () => {
            it('Then it should attach the user to the request and call next()', () => {
                // Given
                const token = 'valid.token.string';
                const decodedUser = { _id: 'userId123', email: 'test@example.com' };
                mockRequest.headers.authorization = token;
                jwt.verify.mockReturnValue(decodedUser);

                // When
                requireSignIn(mockRequest, mockResponse, nextFunction);

                // Then
                expect(mockRequest.user).toEqual(decodedUser);
                expect(nextFunction).toHaveBeenCalled();
            });
        });

        describe('When the authorization token is invalid', () => {
            it('Then it should log an error and not proceed', () => {
                // Given
                const error = new Error('Invalid token');
                mockRequest.headers.authorization = 'invalid.token';
                jwt.verify.mockImplementation(() => { throw error; });

                // When
                requireSignIn(mockRequest, mockResponse, nextFunction);

                // Then
                expect(console.log).toHaveBeenCalledWith(error);
                expect(nextFunction).not.toHaveBeenCalled();
            });
        });
    });

    describe('Given a request requiring admin access', () => {
        describe('When the user is an admin', () => {
            it('Then it should call next()', async () => {
                // Given
                mockRequest.user = { _id: 'adminUserId' };
                const mockAdminUser = { _id: 'adminUserId', role: 1 };
                userModel.findById.mockResolvedValue(mockAdminUser);

                // When
                await isAdmin(mockRequest, mockResponse, nextFunction);

                // Then
                expect(nextFunction).toHaveBeenCalled();
                expect(mockResponse.send).not.toHaveBeenCalled();
            });
        });

        describe('When the user is not an admin', () => {
            it('Then it should send a 401 Unauthorized error', async () => {
                // Given
                mockRequest.user = { _id: 'nonAdminUserId' };
                const mockUser = { _id: 'nonAdminUserId', role: 0 };
                userModel.findById.mockResolvedValue(mockUser);

                // When
                await isAdmin(mockRequest, mockResponse, nextFunction);

                // Then
                expect(mockResponse.status).toHaveBeenCalledWith(401);
                expect(mockResponse.send).toHaveBeenCalledWith({
                    success: false,
                    message: 'UnAuthorized Access',
                });
                expect(nextFunction).not.toHaveBeenCalled();
            });
        });

        describe('When the user is not found in the database', () => {
            it('Then it should handle the error and send a 401 response', async () => {
                // Given
                mockRequest.user = { _id: 'notFoundUserId' };
                userModel.findById.mockResolvedValue(null);
        
                // When
                await isAdmin(mockRequest, mockResponse, nextFunction);
        
                // Then
                expect(mockResponse.status).toHaveBeenCalledWith(401);
                expect(mockResponse.send).toHaveBeenCalledWith(expect.objectContaining({
                    message: "Error in admin middleware"
                }));
                expect(nextFunction).not.toHaveBeenCalled();
            });
        });
        
        describe('When a database error occurs', () => {
            it('Then it should handle the error and send a 401 response', async () => {
                // Given
                const dbError = new Error('Database connection failed');
                mockRequest.user = { _id: 'anyUserId' };
                userModel.findById.mockRejectedValue(dbError);

                // When
                await isAdmin(mockRequest, mockResponse, nextFunction);

                // Then
                expect(mockResponse.status).toHaveBeenCalledWith(401);
                expect(mockResponse.send).toHaveBeenCalledWith({
                    success: false,
                    error: dbError,
                    message: 'Error in admin middleware',
                });
                expect(nextFunction).not.toHaveBeenCalled();
            });
        });
    });
});