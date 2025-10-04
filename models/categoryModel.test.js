import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import categoryModel from "./categoryModel.js";

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
    await categoryModel.deleteMany({});
});

describe("Given that our mongo server is running", () => {
    test("When saving a normal name and slug", async () => {
        const cat = new categoryModel({ name: "Books", slug: "My-Category" });
        const saved = await cat.save();

        expect(saved.name).toBe("Books");
        expect(saved.slug).toBe("my-category");
    });

    test("When saving an empty string name and slug", async () => {
        const cat = new categoryModel({ name: "SomeName", slug: "" });
        const saved = await cat.save();

        expect(saved.slug).toBe("");
    });

    test("When saving a category with missing fields", async () => {
        const cat = new categoryModel({ name: "SomeName" });
        const saved = await cat.save();

        expect(saved.slug).toBeUndefined();
    });

    test("When saving save a very long string", async () => {
        const longName = "A".repeat(1000);
        const longSlug = "B".repeat(1000);
        const cat = new categoryModel({ name: longName, slug: longSlug });
        const saved = await cat.save();

        expect(saved.name.length).toBe(1000);
        expect(saved.slug.length).toBe(1000);
    });
});
