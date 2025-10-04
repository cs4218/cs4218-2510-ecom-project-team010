import router from './authRoute.js';
import {
    registerController,
    loginController,
    testController,
    forgotPasswordController,
    updateProfileController,
    getOrdersController,
    getAllOrdersController,
    orderStatusController,
    getAllUsersController,
} from '../controllers/authController.js';
import { isAdmin, requireSignIn } from '../middlewares/authMiddleware.js';

// Mock the controller and middleware modules
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

jest.mock('../middlewares/authMiddleware.js', () => ({
    requireSignIn: jest.fn(),
    isAdmin: jest.fn(),
}));

describe('Given the Auth Routes are configured', () => {
    const findRoute = (path, method) => {
        return router.stack.find(
            (layer) => layer.route && layer.route.path === path && layer.route.methods[method]
        );
    };

    describe('When a POST request is made to /register', () => {
        it('Then it should be handled by the registerController', () => {
            const route = findRoute('/register', 'post');
            expect(route).toBeDefined();
            expect(route.route.stack[0].handle).toBe(registerController);
        });
    });

    describe('When a POST request is made to /login', () => {
        it('Then it should be handled by the loginController', () => {
            const route = findRoute('/login', 'post');
            expect(route).toBeDefined();
            expect(route.route.stack[0].handle).toBe(loginController);
        });
    });

    describe('When a POST request is made to /forgot-password', () => {
        it('Then it should be handled by the forgotPasswordController', () => {
            const route = findRoute('/forgot-password', 'post');
            expect(route).toBeDefined();
            expect(route.route.stack[0].handle).toBe(forgotPasswordController);
        });
    });

    describe('When a GET request is made to a protected user route', () => {
        it('Then /user-auth should require sign-in', () => {
            const route = findRoute('/user-auth', 'get');
            expect(route).toBeDefined();
            const handlers = route.route.stack;
            expect(handlers[0].handle).toBe(requireSignIn);
        });

        it('Then /profile should require sign-in and use the updateProfileController', () => {
            const route = findRoute('/profile', 'put');
            expect(route).toBeDefined();
            const handlers = route.route.stack;
            expect(handlers[0].handle).toBe(requireSignIn);
            expect(handlers[1].handle).toBe(updateProfileController);
        });
    });

    describe('When a GET request is made to a protected admin route', () => {
        it('Then /admin-auth should require sign-in and admin access', () => {
            const route = findRoute('/admin-auth', 'get');
            expect(route).toBeDefined();
            const handlers = route.route.stack;
            expect(handlers[0].handle).toBe(requireSignIn);
            expect(handlers[1].handle).toBe(isAdmin);
        });

        it('Then /all-orders should require sign-in and admin access', () => {
            const route = findRoute('/all-orders', 'get');
            expect(route).toBeDefined();
            const handlers = route.route.stack;
            expect(handlers[0].handle).toBe(requireSignIn);
            expect(handlers[1].handle).toBe(isAdmin);
            expect(handlers[2].handle).toBe(getAllOrdersController);
        });

        it('Then /all-users should require sign-in and admin access and use the getAllUsersController', () => {
            const route = findRoute('/all-users', 'get');
            expect(route).toBeDefined();
            const handlers = route.route.stack;
            expect(handlers.length).toBe(3);
            expect(handlers[0].handle).toBe(requireSignIn);
            expect(handlers[1].handle).toBe(isAdmin);
            expect(handlers[2].handle).toBe(getAllUsersController);
        });
    });
});