// Note: these test cases are generated with the help of AI

import mongoose from "mongoose";
import connectDB from "./db.js";

// Mock mongoose
jest.mock("mongoose", () => ({
  connect: jest.fn(),
}));

// Mock console methods
const mockConsoleLog = jest.spyOn(console, "log").mockImplementation();

describe("Testing Database Configuration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variables
    delete process.env.MONGO_URL;
  });

  afterEach(() => {
    mockConsoleLog.mockRestore();
  });

  describe("Testing successful database connection", () => {
    it("connects to database with valid MONGO_URL", async () => {
      // arrange
      process.env.MONGO_URL = "mongodb://localhost:27017/testdb";
      const mockConnection = {
        connection: {
          host: "localhost:27017",
        },
      };
      mongoose.connect.mockResolvedValue(mockConnection);

      // act
      await connectDB();

      // assert
      expect(mongoose.connect).toHaveBeenCalledWith("mongodb://localhost:27017/testdb");
      expect(mockConsoleLog).toHaveBeenCalledWith("Connected To Mongodb Database localhost:27017");
    });
  });

  describe("Testing function behavior", () => {
    it("is an async function", () => {
      // assert
      expect(connectDB).toBeInstanceOf(Function);
      expect(connectDB.constructor.name).toBe("AsyncFunction");
    });

    it("returns undefined on success", async () => {
      // arrange
      process.env.MONGO_URL = "mongodb://localhost:27017/testdb";
      const mockConnection = {
        connection: {
          host: "localhost:27017",
        },
      };
      mongoose.connect.mockResolvedValue(mockConnection);

      // act
      const result = await connectDB();

      // assert
      expect(result).toBeUndefined();
    });

    it("returns undefined on error", async () => {
      // arrange
      process.env.MONGO_URL = "mongodb://localhost:27017/testdb";
      const error = new Error("Test error");
      mongoose.connect.mockRejectedValue(error);

      // act
      const result = await connectDB();

      // assert
      expect(result).toBeUndefined();
    });
  });

  describe("Testing mongoose integration", () => {
    it("calls mongoose.connect with correct parameters", async () => {
      // arrange
      process.env.MONGO_URL = "mongodb://localhost:27017/testdb";
      const mockConnection = {
        connection: {
          host: "localhost:27017",
        },
      };
      mongoose.connect.mockResolvedValue(mockConnection);

      // act
      await connectDB();

      // assert
      expect(mongoose.connect).toHaveBeenCalledTimes(1);
      expect(mongoose.connect).toHaveBeenCalledWith("mongodb://localhost:27017/testdb");
    });
  });
});