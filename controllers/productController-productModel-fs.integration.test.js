import { beforeAll, afterAll, afterEach, describe, it, expect, jest } from '@jest/globals';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import fs from 'fs';
import path from 'path';
import productModel from '../models/productModel.js';

// integration test between productController and real fs and productModel modules
// Resolve absolute path to test image for testing of real fs module
const photoPath = path.resolve(
  process.cwd(),
  'controllers',
  'test-assets',
  'test-image.png'
);
if (!fs.existsSync(photoPath)) {
  throw new Error(`Test image missing at: ${photoPath}`);
}

jest.setTimeout(30000); // give mongodb-memory-server time

// Mock only braintree 
jest.unstable_mockModule('braintree', () => ({
  BraintreeGateway: class {},
  Environment: { Sandbox: {} },
  default: {
    BraintreeGateway: class {},
    Environment: { Sandbox: {} },
  },
}));

let createProductController;

function mockRes() {
  const res = {};
  res.statusCode = 200;
  res.status = jest.fn(code => { res.statusCode = code; return res; });
  res.send = jest.fn(payload => payload);
  return res;
}

describe('integration test between createProductController function and productModel and fs.', () => {
  let mongo;

  beforeAll(async () => {
    // ensure braintree ctor is harmless
    process.env.BRAINTREE_MERCHANT_ID = process.env.BRAINTREE_MERCHANT_ID || 'test';
    process.env.BRAINTREE_PUBLIC_KEY  = process.env.BRAINTREE_PUBLIC_KEY  || 'test';
    process.env.BRAINTREE_PRIVATE_KEY = process.env.BRAINTREE_PRIVATE_KEY || 'test';

    // import controller
    ({ createProductController } = await import('./productController.js'));

    // spin up in-memory Mongo
    mongo = await MongoMemoryServer.create({
    });
    await mongoose.connect(mongo.getUri(), { dbName: 'testdb' });
  });

  afterEach(async () => {
    const collections = await mongoose.connection.db.collections();
    for (const c of collections) await c.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongo) await mongo.stop();
  });

  it('createProductController can process req and interact with real fs module and generate a real productModel object', async () => {
    const req = {
      fields: {
        name: 'Test Product',
        description: 'Nice thing',
        price: 99.5,
        category: new mongoose.Types.ObjectId().toString(),
        quantity: 3,
        shipping: true,
      },
      files: {
        photo: {
          path: photoPath,
          size: fs.statSync(photoPath).size, 
          type: 'image/png',                 
        },
      },
    };
    const res = mockRes();

    await createProductController(req, res);

    // asserts that product model was sent and saved successfully
    expect(res.status).toHaveBeenCalledWith(201);
    // asserts that this product model saved has the correct attributes
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'Product Created Successfully',
        products: expect.objectContaining({
          name: 'Test Product',
          description: 'Nice thing',
          price: 99.5,
          quantity: 3,
          shipping: true,
          slug: expect.any(String),
          photo: expect.objectContaining({
            data: expect.any(Buffer),
            contentType: 'image/png', 
          }),
        }),
      })
    );

    // real product model was saved 
    const saved = await productModel.find({});
    expect(saved).toHaveLength(1);
    expect(saved[0].name).toBe('Test Product');
    expect(saved[0].photo?.data).toBeInstanceOf(Buffer);
  });

  it('createProductController can process req and rejects when required field is missing (eg. name)', async () => {
    const req = {
      fields: {
        description: 'Nice thing',
        price: 99.5,
        category: new mongoose.Types.ObjectId().toString(),
        quantity: 3,
        shipping: true,
      },
      files: {},
    };
    const res = mockRes();

    await createProductController(req, res);

    // failed to send as expected
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ error: 'Name is Required' });

    // no product model objects with missing attributes saved.
    const none = await productModel.find({});
    expect(none).toHaveLength(0);
  });

  it('createProductController can process req and rejects photo larger than 1MB', async () => {
    const req = {
      fields: {
        name: 'Big Photo',
        description: 'desc',
        price: 10,
        category: new mongoose.Types.ObjectId().toString(),
        quantity: 1,
        shipping: false,
      },
      files: {
        photo: {
          size: 1_500_000, 
          path: photoPath, 
          type: 'image/png',
        },
      },
    };
    const res = mockRes();

    await createProductController(req, res);

    // failed to send as expected 
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      error: 'Photo is Required and should be less then 1mb',
    });

    // no product model objects with invalid photos saved. 
    const none = await productModel.find({});
    expect(none).toHaveLength(0);
  });
});


describe('integration test between deleteProductController function and productModel.', () => {
    let mongo;
    let deleteProductController;

  beforeAll(async () => {
    // ensure braintree ctor is harmless
    process.env.BRAINTREE_MERCHANT_ID = process.env.BRAINTREE_MERCHANT_ID || 'test';
    process.env.BRAINTREE_PUBLIC_KEY  = process.env.BRAINTREE_PUBLIC_KEY  || 'test';
    process.env.BRAINTREE_PRIVATE_KEY = process.env.BRAINTREE_PRIVATE_KEY || 'test';

    // import controller
    ({ deleteProductController } = await import('./productController.js'));

    // spin up in-memory Mongo
    mongo = await MongoMemoryServer.create({
    });
    await mongoose.connect(mongo.getUri(), { dbName: 'testdb' });
  });

  afterEach(async () => {
    const collections = await mongoose.connection.db.collections();
    for (const c of collections) await c.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongo) await mongo.stop();
  });



  // checked only the branch interacting with the productModel module
  it('deleteProductController properly interacts with productModel to find and delete product', async () => {
    // seed a product to delete
    const seeded = await productModel.create({
      name: 'Seed To Delete',
      slug: 'seed-to-delete',
      description: 'temp',
      price: 10,
      category: new mongoose.Types.ObjectId(),
      quantity: 1,
      shipping: false,
    });

    const req = { params: { pid: seeded._id.toString() } };
    const res = mockRes();

    await deleteProductController(req, res);

    // product model module could find and delete product successfully 
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'Product Deleted successfully',
      })
    );

    // verify it is truly gone
    const found = await productModel.findById(seeded._id);
    expect(found).toBeNull();
  });
});


describe('integration test between updateProductController function and productModel and fs.', () => {
  let mongo;
  let updateProductController;

  beforeAll(async () => {
    process.env.BRAINTREE_MERCHANT_ID = process.env.BRAINTREE_MERCHANT_ID || 'test';
    process.env.BRAINTREE_PUBLIC_KEY  = process.env.BRAINTREE_PUBLIC_KEY  || 'test';
    process.env.BRAINTREE_PRIVATE_KEY = process.env.BRAINTREE_PRIVATE_KEY || 'test';

    ({ updateProductController } = await import('./productController.js'));

    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri(), { dbName: 'testdb' });
  });

  afterEach(async () => {
    const cols = await mongoose.connection.db.collections();
    for (const c of cols) await c.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongo) await mongo.stop();
  });

  it('createProductController can process req with real fs module and update a real productModel object', async () => {
    // seed an initial product
    const seeded = await productModel.create({
      name: 'Old Name',
      slug: 'old-name',
      description: 'old desc',
      price: 10,
      category: new mongoose.Types.ObjectId(),
      quantity: 1,
      shipping: false,
    });

    const req = {
      params: { pid: seeded._id.toString() },
      fields: {
        name: 'Updated Name',
        description: 'new desc',
        price: 99.5,
        category: new mongoose.Types.ObjectId().toString(),
        quantity: 7,
        shipping: true,
      },
      files: {
        photo: {
          path: photoPath,                     
          size: fs.statSync(photoPath).size,   
          type: 'image/png',
        },
      },
    };
    const res = mockRes();

    await updateProductController(req, res);

    // request is sent successfully 
    expect(res.status).toHaveBeenCalledWith(201);
    // product model object sent has the correct attributes
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'Product Updated Successfully',
        products: expect.objectContaining({
          name: 'Updated Name',
          description: 'new desc',
          price: 99.5,
          quantity: 7,
          shipping: true,
          slug: expect.any(String),
          photo: expect.objectContaining({
            data: expect.any(Buffer),
            contentType: 'image/png',
          }),
        }),
      })
    );

    // verify persisted changes and details are updated.
    const after = await productModel.findById(seeded._id);
    expect(after).not.toBeNull();
    expect(after.name).toBe('Updated Name');
    expect(after.photo?.data).toBeInstanceOf(Buffer);
    expect(after.photo?.contentType).toBe('image/png');
  });

  it('returns 400 when a required field is missing (e.g., name) and does not save faulty product model object.', async () => {
    // seed something to update
    const seeded = await productModel.create({
      name: 'Some Name',
      slug: 'some-name',
      description: 'desc',
      price: 10,
      category: new mongoose.Types.ObjectId(),
      quantity: 1,
      shipping: false,
    });

    const req = {
      params: { pid: seeded._id.toString() },
      fields: {
        // name missing
        description: 'still desc',
        price: 11,
        category: new mongoose.Types.ObjectId().toString(),
        quantity: 2,
        shipping: true,
      },
      files: {},
    };
    const res = mockRes();

    await updateProductController(req, res);

    // faulty product model object is not saved.
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ error: 'Name is Required' });
  });
});

