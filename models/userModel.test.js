import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import userModel from './userModel.js'; 

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    await userModel.deleteMany({});
});


describe('User Model Test', () => {
    it('should create & save a user successfully', async () => {
        const userData = {
            name: "John Doe",
            email: "john@example.com",
            password: "password",
            phone: "12345678",
            address: { houseNumber: '123', street: "john street" },
            answer: "answer",
        };
        const validUser = new userModel(userData);
        const savedUser = await validUser.save();

        // Assertions
        expect(savedUser._id).toBeDefined();
        expect(savedUser.name).toBe("John Doe");
        expect(savedUser.email).toBe("john@example.com");
        expect(savedUser.password).toBe("password");
        expect(savedUser.phone).toBe("12345678");
        expect(savedUser.address.houseNumber).toBe("123");
        expect(savedUser.address.street).toBe("john street");
        expect(savedUser.answer).toBe("answer");
        expect(savedUser.role).toBe(0); 
        expect(savedUser.createdAt).toBeDefined(); 
        expect(savedUser.updatedAt).toBeDefined();
    });
});
