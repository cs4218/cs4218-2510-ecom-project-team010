import bcrypt from 'bcrypt';
import { hashPassword, comparePassword } from './authHelper.js'; // Assuming the helpers are in authHelper.js

// Mock the bcrypt library
jest.mock('bcrypt');

// Mock console.log to prevent logs during tests and to spy on it
global.console = { log: jest.fn(), error: jest.fn() };

describe('Auth Helpers', () => {

    // Reset mocks before each test
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('hashPassword', () => {
        it('should return a hashed password on successful hashing', async () => {
            const password = 'mySecretPassword';
            const hashedPassword = 'hashedSuperSecretPassword';
            
            // Mock the bcrypt.hash implementation for this test
            bcrypt.hash.mockResolvedValue(hashedPassword);

            const result = await hashPassword(password);

            // Expect bcrypt.hash to have been called with the password and salt rounds
            expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
            // Expect the function to return the mocked hashed password
            expect(result).toBe(hashedPassword);
        });

        it('should log an error if hashing fails', async () => {
            const password = 'mySecretPassword';
            const error = new Error('Hashing failed');
            
            // Mock the bcrypt.hash implementation to reject with an error
            bcrypt.hash.mockRejectedValue(error);

            const result = await hashPassword(password);

            // Expect the error to be logged to the console
            expect(console.log).toHaveBeenCalledWith(error);
            // Expect the function to return undefined as per the original code's catch block
            expect(result).toBeUndefined();
        });
    });

    describe('comparePassword', () => {
        it('should call bcrypt.compare with the correct arguments', async () => {
            const password = 'mySecretPassword';
            const hashedPassword = 'hashedSuperSecretPassword';

            // Mock the bcrypt.compare implementation
            bcrypt.compare.mockResolvedValue(true);

            await comparePassword(password, hashedPassword);

            // Expect bcrypt.compare to have been called with the plain password and the hashed one
            expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
        });

        it('should return the result of bcrypt.compare', async () => {
            const password = 'mySecretPassword';
            const hashedPassword = 'hashedSuperSecretPassword';

            // Test for a matching password
            bcrypt.compare.mockResolvedValue(true);
            let result = await comparePassword(password, hashedPassword);
            expect(result).toBe(true);

            // Test for a non-matching password
            bcrypt.compare.mockResolvedValue(false);
            result = await comparePassword('wrongPassword', hashedPassword);
            expect(result).toBe(false);
        });
    });
});
