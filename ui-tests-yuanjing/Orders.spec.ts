import { test, expect } from '@playwright/test';

// The base URL of your local development server
const BASE_URL = 'http://localhost:3000';

// A unique user for this test suite
const testUser = {
  name: 'Order Test User',
  email: `order_test_${Date.now()}@example.com`,
  password: 'password123',
  phone: '87654321',
  address: '456 Order Avenue',
  dob: '1998-08-18',
  answer: 'E2E Testing',
};

// Group all order-related tests
test.describe('User Orders Page Flow', () => {

  // --- Tests for Authenticated Users ---
  test.describe('when logged in', () => {

    // Before each test in this group, register and log in a new user.
    // This provides a clean, authenticated state for every test.
    test.beforeEach(async ({ page }) => {
      // Use a new unique email for each test run to ensure isolation
      const uniqueEmail = `order_test_${Date.now()}@example.com`;

      // Register the user
      await page.goto(`${BASE_URL}/register`);
      await page.getByPlaceholder('Enter Your Name').fill(testUser.name);
      await page.getByPlaceholder('Enter Your Email ').fill(uniqueEmail);
      await page.getByPlaceholder('Enter Your Password').fill(testUser.password);
      await page.getByPlaceholder('Enter Your Phone').fill(testUser.phone);
      await page.getByPlaceholder('Enter Your Address').fill(testUser.address);
      await page.getByPlaceholder('Enter Your DOB').fill(testUser.dob);
      await page.getByPlaceholder('What is Your Favorite sports').fill(testUser.answer);
      await page.getByRole('button', { name: 'REGISTER' }).click();
      await page.waitForURL(`${BASE_URL}/login`);
      
      // Log in the user
      await page.getByPlaceholder('Enter Your Email').fill(uniqueEmail);
      await page.getByPlaceholder('Enter Your Password').fill(testUser.password);
      await page.getByRole('button', { name: 'LOGIN' }).click();
      await page.waitForURL(`${BASE_URL}/`);
    });

    test('should display the orders page correctly when there are no orders', async ({ page }) => {
      // GIVEN: A logged-in user who has no orders.
      // We will intercept the API call and return an empty array.
      await page.route('**/api/v1/auth/orders', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]), // Mock an empty response
        });
      });

      // WHEN: The user navigates to their dashboard and then to the Orders page.
      await page.goto(`${BASE_URL}/dashboard/user`);
      await page.getByRole('link', { name: 'Orders' }).click();
      
      // THEN: The user should be on the orders page and see the main heading.
      await expect(page).toHaveURL(`${BASE_URL}/dashboard/user/orders`);
      await expect(page.getByRole('heading', { name: 'All Orders' })).toBeVisible();
      // AND we expect not to see any order tables.
      await expect(page.locator('.border.shadow')).toHaveCount(0);
    });

    test('should display a list of orders for an authenticated user', async ({ page }) => {
      // GIVEN: A logged-in user has previously placed orders.
      // We will intercept the API call and return mock order data.
      const mockOrders = [
        {
          _id: 'order123',
          status: 'Processing',
          buyer: { name: testUser.name },
          createAt: new Date().toISOString(),
          payment: { success: true },
          products: [
            { _id: 'prod1', name: 'Test Product 1', description: 'Description for product 1', price: 10 },
            { _id: 'prod2', name: 'Test Product 2', description: 'Description for product 2', price: 20 },
          ],
        },
      ];

      await page.route('**/api/v1/auth/orders', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockOrders),
        });
      });

      // WHEN: The user navigates to the Orders page.
      await page.goto(`${BASE_URL}/dashboard/user/orders`);

      // THEN: The order details should be visible on the page.
      await expect(page.getByRole('heading', { name: 'All Orders' })).toBeVisible();
      
      // Check the main order table details
      await expect(page.getByRole('cell', { name: 'Processing' })).toBeVisible();
      await expect(page.getByRole('cell', { name: testUser.name })).toBeVisible();
      await expect(page.getByRole('cell', { name: 'Success' })).toBeVisible();
      await expect(page.getByRole('cell', { name: '2' })).toBeVisible(); // Quantity

      // Check the details of the products within the order
      await expect(page.getByText('Test Product 1')).toBeVisible();
      await expect(page.getByText('Description for product 1')).toBeVisible();
      await expect(page.getByText('Price : 10')).toBeVisible();

      await expect(page.getByText('Test Product 2')).toBeVisible();
      await expect(page.getByText('Description for product 2')).toBeVisible();
      await expect(page.getByText('Price : 20')).toBeVisible();
    });
  });

  // --- Tests for Unauthenticated Users ---
  test.describe('when not logged in', () => {
    test('should redirect unauthenticated users from the orders page to login', async ({ page }) => {
      // GIVEN: An unauthenticated user.
      // WHEN: They try to access the user orders page directly.
      await page.goto(`${BASE_URL}/dashboard/user/orders`);

      // THEN: They should be redirected to the login page.
      await expect(page).toHaveURL(`${BASE_URL}/`);
    });
  });
});

