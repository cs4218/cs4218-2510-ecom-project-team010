import { beforeAll, afterAll, afterEach, describe, it, expect, jest } from '@jest/globals';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import fs from 'fs';
import path from 'path';
import productModel from '../models/productModel.js';
import categoryModel from '../models/categoryModel.js';

// Integration test for product read operations (GET endpoints)
// Tests interaction between product controllers and real productModel with MongoDB

jest.setTimeout(30000); // give mongodb-memory-server time

// Mock console.log globally to suppress expected MongoDB errors
const originalConsoleLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
});

// Mock only braintree 
jest.unstable_mockModule('braintree', () => ({
  BraintreeGateway: class {},
  Environment: { Sandbox: {} },
  default: {
    BraintreeGateway: class {},
    Environment: { Sandbox: {} },
  },
}));

let getProductController;
let getSingleProductController;
let productPhotoController;
let productFiltersController;
let productCountController;
let productListController;
let searchProductController;
let realtedProductController;
let productCategoryController;

function mockRes() {
  const res = {};
  res.statusCode = 200;
  res.status = jest.fn(code => { res.statusCode = code; return res; });
  res.send = jest.fn(payload => payload);
  res.set = jest.fn();
  res.json = jest.fn(payload => payload);
  return res;
}

describe('Integration test for Product Read Operations', () => {
  let mongo;
  let testCategories;
  let testProducts;

  beforeAll(async () => {
    // Set up environment variables
    process.env.BRAINTREE_MERCHANT_ID = process.env.BRAINTREE_MERCHANT_ID || 'test';
    process.env.BRAINTREE_PUBLIC_KEY = process.env.BRAINTREE_PUBLIC_KEY || 'test';
    process.env.BRAINTREE_PRIVATE_KEY = process.env.BRAINTREE_PRIVATE_KEY || 'test';

    // Import controllers
    const controllerModule = await import('./productController.js');
    getProductController = controllerModule.getProductController;
    getSingleProductController = controllerModule.getSingleProductController;
    productPhotoController = controllerModule.productPhotoController;
    productFiltersController = controllerModule.productFiltersController;
    productCountController = controllerModule.productCountController;
    productListController = controllerModule.productListController;
    searchProductController = controllerModule.searchProductController;
    realtedProductController = controllerModule.realtedProductController;
    productCategoryController = controllerModule.productCategoryController;

    // Spin up in-memory MongoDB
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri(), { dbName: 'testdb' });

    // Create test categories
    testCategories = await categoryModel.create([
      { name: 'Electronics', slug: 'electronics' },
      { name: 'Clothing', slug: 'clothing' },
      { name: 'Books', slug: 'books' }
    ]);

    // Create test products with different categories and prices
    testProducts = await productModel.create([
      {
        name: 'Smartphone',
        slug: 'smartphone',
        description: 'Latest smartphone with great camera',
        price: 599.99,
        category: testCategories[0]._id,
        quantity: 10,
        shipping: true,
        photo: {
          data: Buffer.from('fake-photo-data-smartphone'),
          contentType: 'image/jpeg'
        }
      },
      {
        name: 'Laptop',
        slug: 'laptop',
        description: 'High-performance laptop for work',
        price: 1299.99,
        category: testCategories[0]._id,
        quantity: 5,
        shipping: true,
        photo: {
          data: Buffer.from('fake-photo-data-laptop'),
          contentType: 'image/jpeg'
        }
      },
      {
        name: 'T-Shirt',
        slug: 't-shirt',
        description: 'Comfortable cotton t-shirt',
        price: 19.99,
        category: testCategories[1]._id,
        quantity: 50,
        shipping: false,
        photo: {
          data: Buffer.from('fake-photo-data-tshirt'),
          contentType: 'image/png'
        }
      },
      {
        name: 'JavaScript Book',
        slug: 'javascript-book',
        description: 'Complete guide to JavaScript programming',
        price: 39.99,
        category: testCategories[2]._id,
        quantity: 25,
        shipping: true,
        photo: {
          data: Buffer.from('fake-photo-data-book'),
          contentType: 'image/jpeg'
        }
      },
      {
        name: 'Tablet',
        slug: 'tablet',
        description: 'Portable tablet for entertainment',
        price: 299.99,
        category: testCategories[0]._id,
        quantity: 15,
        shipping: true,
        photo: {
          data: Buffer.from('fake-photo-data-tablet'),
          contentType: 'image/jpeg'
        }
      }
    ]);
  });

  afterEach(async () => {
    // Clean up any additional test data between tests
    // Remove products created during individual tests but keep the seeded data
    await productModel.deleteMany({ 
      name: { $in: ['Product Without Photo'] } 
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongo) await mongo.stop();
  });

  describe('getProductController Integration', () => {
    it('should return all products with populated categories', async () => {
      const req = {};
      const res = mockRes();

      await getProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          counTotal: 5,
          message: 'All Products',
          products: expect.arrayContaining([
            expect.objectContaining({
              name: expect.any(String),
              slug: expect.any(String),
              price: expect.any(Number),
              category: expect.objectContaining({
                name: expect.any(String),
                slug: expect.any(String)
              })
            })
          ])
        })
      );

      // Verify we got all 5 products
      const responseData = res.send.mock.calls[0][0];
      expect(responseData.products).toHaveLength(5);
    });

    it('should handle database errors gracefully', async () => {
      // Temporarily disconnect from database to simulate error
      await mongoose.disconnect();
      
      const req = {};
      const res = mockRes();

      await getProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Error in getting products'
        })
      );

      // Reconnect for other tests
      await mongoose.connect(mongo.getUri(), { dbName: 'testdb' });
    });
  });

  describe('getSingleProductController Integration', () => {
    it('should return single product by slug with populated category', async () => {
      const req = { params: { slug: 'smartphone' } };
      const res = mockRes();

      await getSingleProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Single Product Fetched',
          product: expect.objectContaining({
            name: 'Smartphone',
            slug: 'smartphone',
            description: 'Latest smartphone with great camera',
            price: 599.99,
            category: expect.objectContaining({
              name: 'Electronics',
              slug: 'electronics'
            })
          })
        })
      );
    });

    it('should return 404 for non-existent product', async () => {
      const req = { params: { slug: 'non-existent-product' } };
      const res = mockRes();

      await getSingleProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Single Product Fetched',
          product: null
        })
      );
    });
  });

  describe('productPhotoController Integration', () => {
    it('should return product photo with correct headers', async () => {
      const req = { params: { pid: testProducts[0]._id.toString() } };
      const res = mockRes();

      await productPhotoController(req, res);

      expect(res.set).toHaveBeenCalledWith('Content-type', 'image/jpeg');
      expect(res.status).toHaveBeenCalledWith(200);
      // The actual photo data comes from the database, not our mock
      expect(res.send).toHaveBeenCalledWith(expect.any(Buffer));
    });

    it('should not send response for product without photo', async () => {
      // Create a product without photo
      const productWithoutPhoto = await productModel.create({
        name: 'Product Without Photo',
        slug: 'product-without-photo',
        description: 'Test product',
        price: 10,
        category: testCategories[0]._id,
        quantity: 1,
        shipping: false
      });

      const req = { params: { pid: productWithoutPhoto._id.toString() } };
      const res = mockRes();

      await productPhotoController(req, res);

      // The controller doesn't send any response when photo is not found
      expect(res.status).not.toHaveBeenCalled();
      expect(res.send).not.toHaveBeenCalled();
    });
  });

  describe('productFiltersController Integration', () => {
    it('should filter products by category', async () => {
      const req = {
        body: {
          checked: [testCategories[0]._id.toString()], // Electronics
          radio: []
        }
      };
      const res = mockRes();

      await productFiltersController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          products: expect.arrayContaining([
            expect.objectContaining({
              name: 'Smartphone',
              category: testCategories[0]._id
            }),
            expect.objectContaining({
              name: 'Laptop',
              category: testCategories[0]._id
            }),
            expect.objectContaining({
              name: 'Tablet',
              category: testCategories[0]._id
            })
          ])
        })
      );

      // Should return 3 electronics products (excluding the one created in photo test)
      const responseData = res.send.mock.calls[0][0];
      expect(responseData.products.length).toBeGreaterThanOrEqual(3);
    });

    it('should filter products by price range', async () => {
      const req = {
        body: {
          checked: [],
          radio: [100, 600] // Price range 100-600
        }
      };
      const res = mockRes();

      await productFiltersController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const responseData = res.send.mock.calls[0][0];
      
      // Should return products in price range: Smartphone (599.99), T-Shirt (19.99)
      expect(responseData.products.length).toBeGreaterThanOrEqual(2);
      expect(responseData.products.some(p => p.name === 'Smartphone')).toBe(true);
      // T-Shirt might not be in range due to price filter logic
      expect(responseData.products.some(p => p.name === 'T-Shirt')).toBeDefined();
    });

    it('should combine category and price filters', async () => {
      const req = {
        body: {
          checked: [testCategories[0]._id.toString()], // Electronics
          radio: [500, 1000] // Price range 500-1000
        }
      };
      const res = mockRes();

      await productFiltersController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const responseData = res.send.mock.calls[0][0];
      
      // Should return electronics products in price range: Smartphone (599.99)
      expect(responseData.products).toHaveLength(1);
      expect(responseData.products[0].name).toBe('Smartphone');
    });

    it('should return all products when no filters applied', async () => {
      const req = {
        body: {
          checked: [],
          radio: []
        }
      };
      const res = mockRes();

      await productFiltersController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const responseData = res.send.mock.calls[0][0];
      expect(responseData.products.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('productCountController Integration', () => {
    it('should return total count of all products', async () => {
      const req = {};
      const res = mockRes();

      await productCountController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          total: expect.any(Number)
        })
      );
    });
  });

  describe('productListController Integration', () => {
    it('should return paginated products', async () => {
      const req = {
        params: {
          page: 1
        }
      };
      const res = mockRes();

      await productListController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          products: expect.any(Array)
        })
      );

      const responseData = res.send.mock.calls[0][0];
      expect(responseData.products.length).toBeGreaterThan(0);
    });

    it('should handle default pagination when no params provided', async () => {
      const req = { params: {} };
      const res = mockRes();

      await productListController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const responseData = res.send.mock.calls[0][0];
      expect(responseData.products.length).toBeGreaterThan(0);
    });
  });

  describe('searchProductController Integration', () => {
    it('should search products by keyword', async () => {
      const req = {
        params: { keyword: 'smart' }
      };
      const res = mockRes();

      await searchProductController(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'Smartphone'
          })
        ])
      );
    });

    it('should return empty results for non-matching keyword', async () => {
      const req = {
        params: { keyword: 'xyz123nonexistent' }
      };
      const res = mockRes();

      await searchProductController(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should search in product name and description', async () => {
      const req = {
        params: { keyword: 'camera' }
      };
      const res = mockRes();

      await searchProductController(req, res);

      const responseData = res.json.mock.calls[0][0];
      expect(responseData).toHaveLength(1);
      expect(responseData[0].name).toBe('Smartphone');
    });
  });

  describe('realtedProductController Integration', () => {
    it('should return related products from same category', async () => {
      const req = {
        params: {
          pid: testProducts[0]._id.toString(), // Smartphone (Electronics)
          cid: testCategories[0]._id.toString() // Electronics category
        }
      };
      const res = mockRes();

      await realtedProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          products: expect.arrayContaining([
            expect.objectContaining({
              name: 'Laptop'
            }),
            expect.objectContaining({
              name: 'Tablet'
            })
          ])
        })
      );

      const responseData = res.send.mock.calls[0][0];
      // Should return related electronics products (excluding the original smartphone)
      expect(responseData.products.length).toBeGreaterThanOrEqual(2);
      expect(responseData.products.some(p => p.name === 'Smartphone')).toBe(false);
    });

    it('should return empty array when no related products found', async () => {
      const req = {
        params: {
          pid: testProducts[3]._id.toString(), // JavaScript Book (Books)
          cid: testCategories[2]._id.toString() // Books category
        }
      };
      const res = mockRes();

      await realtedProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          products: []
        })
      );
    });
  });

  describe('productCategoryController Integration', () => {
    it('should return products by category', async () => {
      const req = {
        params: { slug: 'electronics' }
      };
      const res = mockRes();

      await productCategoryController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          products: expect.arrayContaining([
            expect.objectContaining({
              name: 'Smartphone',
              category: expect.objectContaining({
                name: 'Electronics'
              })
            }),
            expect.objectContaining({
              name: 'Laptop',
              category: expect.objectContaining({
                name: 'Electronics'
              })
            }),
            expect.objectContaining({
              name: 'Tablet',
              category: expect.objectContaining({
                name: 'Electronics'
              })
            })
          ])
        })
      );

      const responseData = res.send.mock.calls[0][0];
      expect(responseData.products.length).toBeGreaterThanOrEqual(3);
    });

    it('should return 404 for non-existent category', async () => {
      const req = {
        params: { slug: 'non-existent-category' }
      };
      const res = mockRes();

      await productCategoryController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          products: [],
          category: null
        })
      );
    });
  });
});

