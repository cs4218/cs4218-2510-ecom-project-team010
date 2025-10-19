import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import userModel from "../models/userModel.js"; 

let mongoServer;

// Setup: Connect to a new in-memory database before all tests run
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    await userModel.init();
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

describe("User Model Integration Test", () => {
    it("should create and save a user successfully", async () => {
        // Given: A valid user payload
        const userData = {
            name: "  Test User  ", // will be trimmed
            email: "  test@example.com  ", // will be trimmed
            password: "password123",
            phone: "1234567890",
            address: { line1: "123 Test St" },
            answer: "Blue",
            // role omitted → should default to 0
        };

        // When: Creating and saving a user
        const user = new userModel(userData);
        const saved = await user.save();

        // Then: Document is persisted with trims, defaults, timestamps
        expect(saved._id).toBeDefined();
        expect(saved.name).toBe("Test User");
        expect(saved.email).toBe("test@example.com");
        expect(saved.phone).toBe("1234567890");
        expect(saved.address).toEqual({
            line1: "123 Test St",
        });
        expect(saved.role).toBe(0); // default
        expect(saved.createdAt).toBeInstanceOf(Date);
        expect(saved.updatedAt).toBeInstanceOf(Date);
    });

    it("should enforce required fields (validation error)", async () => {
        // Given: Missing required 'email'
        const user = new userModel({
            name: "No Email",
            // email missing
            password: "secret",
            phone: "9999",
            address: { line1: "Somewhere" },
            answer: "Green",
        });

        // When & Then: Save rejects with a ValidationError
        await expect(user.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it("should enforce unique email via index (duplicate key 11000)", async () => {
        // Given: First user saved with an email
        await userModel.create({
            name: "First",
            email: "unique@example.com",
            password: "secret",
            phone: "1111",
            address: { line1: "A" },
            answer: "Ans",
        });

        // When: Creating a second user with the same email (even with whitespace)
        let error;
        try {
            await userModel.create({
                name: "Second",
                email: "  unique@example.com  ",
                password: "secret",
                phone: "2222",
                address: { line1: "B" },
                answer: "Ans",
            });
        } catch (e) {
            error = e;
        }

        // Then: Duplicate key error is thrown by Mongo
        expect(error).toMatchObject({ name: "MongoServerError", code: 11000 });
    });

    it("should trim string fields (name, email) on create", async () => {
        // Given: Strings with extra whitespace
        const created = await userModel.create({
            name: "  Alice  ",
            email: "  alice@example.com ",
            password: "pass",
            phone: "1234",
            address: { city: "SG" },
            answer: "Blue",
        });

        // Then: Stored values are trimmed
        expect(created.name).toBe("Alice");
        expect(created.email).toBe("alice@example.com");
    });

    it("should update timestamps on subsequent saves", async () => {
        // Given: An existing user
        const created = await userModel.create({
            name: "Time",
            email: "timey@example.com",
            password: "p",
            phone: "0000",
            address: { line1: "Addr" },
            answer: "Ans",
        });

        const originalUpdatedAt = created.updatedAt;

        // When: Modify and save again
        created.name = "Time Updated";
        const saved = await created.save();

        // Then: updatedAt moves forward
        expect(saved.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it("should persist mixed address object", async () => {
        // Given: Nested/mixed address
        const created = await userModel.create({
            name: "Mix",
            email: "mix@example.com",
            password: "p",
            phone: "123",
            address: { line1: "Jurong", postal: "600000", nested: { a: 1 } },
            answer: "Ans",
        });

        // When: Reading back
        const found = await userModel.findById(created._id).lean();

        // Then: Exact object is persisted
        expect(found.address).toEqual({
            line1: "Jurong",
            postal: "600000",
            nested: { a: 1 },
        });
    });
});