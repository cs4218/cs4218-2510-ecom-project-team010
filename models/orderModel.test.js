import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import orderModel from './orderModel.js'; // Assuming the model is in orderModel.js

let mongoServer;

// Setup for the in-memory database
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
});

// Teardown for the in-memory database
afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

// Clean up data after each test
afterEach(async () => {
    await orderModel.deleteMany({});
});


describe('Order Model Test', () => {

    it('should create & save an order successfully', async () => {
        const buyerId = new mongoose.Types.ObjectId();
        const productId = new mongoose.Types.ObjectId();
        
        const orderData = {
            products: [productId],
            payment: { transactionId: 'txn123', success: true },
            buyer: buyerId,
        };
        const validOrder = new orderModel(orderData);
        const savedOrder = await validOrder.save();

        // Assertions
        expect(savedOrder._id).toBeDefined();
        expect(savedOrder.products[0].toString()).toBe(productId.toString());
        expect(savedOrder.payment.transactionId).toBe('txn123');
        expect(savedOrder.buyer.toString()).toBe(buyerId.toString());
        expect(savedOrder.status).toBe('Not Process'); // Check default value
        expect(savedOrder.createdAt).toBeDefined(); // Check timestamps
        expect(savedOrder.updatedAt).toBeDefined();
    });

    it('should fail when creating an order with an invalid status', async () => {
        const orderData = {
            buyer: new mongoose.Types.ObjectId(),
            status: 'Pending', // This is not in the enum list
        };
        const invalidOrder = new orderModel(orderData);
        
        // Expect the save promise to reject with a ValidationError
        let err;
        try {
            await invalidOrder.save();
        } catch (error) {
            err = error;
        }
        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
        expect(err.errors.status).toBeDefined();
    });

    it('should correctly set one of the valid enum statuses', async () => {
        const orderData = {
            buyer: new mongoose.Types.ObjectId(),
            status: 'Shipped', // A valid status from the enum
        };
        const validOrder = new orderModel(orderData);
        const savedOrder = await validOrder.save();
        
        expect(savedOrder.status).toBe('Shipped');
    });

    it('should not have a payment field if not provided', async () => {
        const orderData = {
            buyer: new mongoose.Types.ObjectId(),
            products: [new mongoose.Types.ObjectId()],
        };
        const order = new orderModel(orderData);
        const savedOrder = await order.save();
        
        expect(savedOrder._id).toBeDefined();
        // Payment field should be undefined if not provided in the data
        expect(savedOrder.payment).toBeUndefined();
    });

});

