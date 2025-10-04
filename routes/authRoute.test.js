import router from './authRoute.js';

// Mock the controllers
import {
    registerController,
    loginController,
    testController,
    forgotPasswordController,
    updateProfileController,
    getOrdersController,
    getAllOrdersController,
    orderStatusController,
    getAllUsersController
} from '../controllers/authController.js';

// Mock the middleware
import { isAdmin, requireSignIn } from '../middlewares/authMiddleware.js';

// Mock the entire controller module
jest.mock('../controllers/authController.js', () => ({
    registerController: jest.fn(),
    loginController: jest.fn(),
    testController: jest.fn(),
    forgotPasswordController: jest.fn(),
    updateProfileController: jest.fn(),
    getOrdersController: jest.fn(),
    getAllOrdersController: jest.fn(),
    orderStatusController: jest.fn(),
    getAllUsersController: jest.fn(),
}));

// Mock the entire middleware module
jest.mock('../middlewares/authMiddleware.js', () => ({
    requireSignIn: jest.fn(),
    isAdmin: jest.fn(),
}));


describe('Auth Routes Configuration', () => {
    // Helper function to find a specific route configuration in the router stack
    const findRoute = (path, method) => {
        return router.stack.find(
            (layer) => layer.route && layer.route.path === path && layer.route.methods[method]
        );
    };

    it('should register POST /register with the registerController', () => {
        const route = findRoute('/register', 'post');
        expect(route).toBeDefined();
        expect(route.route.stack.length).toBe(1);
        expect(route.route.stack[0].handle).toBe(registerController);
    });

    it('should register POST /login with the loginController', () => {
        const route = findRoute('/login', 'post');
        expect(route).toBeDefined();
        expect(route.route.stack.length).toBe(1);
        expect(route.route.stack[0].handle).toBe(loginController);
    });

    it('should register POST /forgot-password with the forgotPasswordController', () => {
        const route = findRoute('/forgot-password', 'post');
        expect(route).toBeDefined();
        expect(route.route.stack.length).toBe(1);
        expect(route.route.stack[0].handle).toBe(forgotPasswordController);
    });

    it('should register GET /test with requireSignIn, isAdmin, and testController', () => {
        const route = findRoute('/test', 'get');
        expect(route).toBeDefined();
        const handlers = route.route.stack;
        expect(handlers.length).toBe(3);
        expect(handlers[0].handle).toBe(requireSignIn);
        expect(handlers[1].handle).toBe(isAdmin);
        expect(handlers[2].handle).toBe(testController);
    });

    describe('Protected Routes', () => {
        it('should register GET /user-auth with requireSignIn middleware', () => {
            const route = findRoute('/user-auth', 'get');
            expect(route).toBeDefined();
            const handlers = route.route.stack;
            expect(handlers.length).toBe(2);
            expect(handlers[0].handle).toBe(requireSignIn);
            expect(typeof handlers[1].handle).toBe('function'); // inline handler
        });

        it('should register GET /admin-auth with requireSignIn and isAdmin middleware', () => {
            const route = findRoute('/admin-auth', 'get');
            expect(route).toBeDefined();
            const handlers = route.route.stack;
            expect(handlers.length).toBe(3);
            expect(handlers[0].handle).toBe(requireSignIn);
            expect(handlers[1].handle).toBe(isAdmin);
            expect(typeof handlers[2].handle).toBe('function'); // inline handler
        });

        it('should register GET /all-users with requireSignIn and isAdmin middleware', () => {
            const route = findRoute('/all-users', 'get');
            expect(route).toBeDefined();
            const handlers = route.route.stack;
            expect(handlers.length).toBe(3);
            expect(handlers[0].handle).toBe(requireSignIn);
            expect(handlers[1].handle).toBe(isAdmin);
            expect(handlers[2].handle).toBe(getAllUsersController);
        });
    });

    it('should register PUT /profile with requireSignIn and updateProfileController', () => {
        const route = findRoute('/profile', 'put');
        expect(route).toBeDefined();
        const handlers = route.route.stack;
        expect(handlers.length).toBe(2);
        expect(handlers[0].handle).toBe(requireSignIn);
        expect(handlers[1].handle).toBe(updateProfileController);
    });

    describe('Order Routes', () => {
        it('should register GET /orders with requireSignIn and getOrdersController', () => {
            const route = findRoute('/orders', 'get');
            expect(route).toBeDefined();
            const handlers = route.route.stack;
            expect(handlers.length).toBe(2);
            expect(handlers[0].handle).toBe(requireSignIn);
            expect(handlers[1].handle).toBe(getOrdersController);
        });

        it('should register GET /all-orders with requireSignIn, isAdmin, and getAllOrdersController', () => {
            const route = findRoute('/all-orders', 'get');
            expect(route).toBeDefined();
            const handlers = route.route.stack;
            expect(handlers.length).toBe(3);
            expect(handlers[0].handle).toBe(requireSignIn);
            expect(handlers[1].handle).toBe(isAdmin);
            expect(handlers[2].handle).toBe(getAllOrdersController);
        });

        it('should register PUT /order-status/:orderId with correct middleware and controller', () => {
            const route = findRoute('/order-status/:orderId', 'put');
            expect(route).toBeDefined();
            const handlers = route.route.stack;
            expect(handlers.length).toBe(3);
            expect(handlers[0].handle).toBe(requireSignIn);
            expect(handlers[1].handle).toBe(isAdmin);
            expect(handlers[2].handle).toBe(orderStatusController);
        });
    });
});

