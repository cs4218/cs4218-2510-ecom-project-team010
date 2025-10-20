import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

const testUser = {
  name: 'Cart Test User',
  email: `cart_test_${Date.now()}@example.com`,
  password: 'password123',
  phone: '87654321',
  address: '123 Cart Lane', // User has an address by default for testing checkout
  dob: '1999-01-01',
  answer: 'Cart Testing',
};

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:3000/');
  
});

// janna's test cases for when a guest accesses the cart page
test.describe('Guest accessing cart page', () => {
    test('Without any log in and an empty cart, greeting is correct', async ({ page }) => {
        await page.getByRole('link', { name: 'Cart' }).click();

        await expect(page.getByRole('heading', { name: 'Hello Guest Your Cart Is Empty' })).toBeVisible();
    });

    test('Without any log in and an empty cart, cart summary is correct', async ({ page }) => {
        await page.getByRole('link', { name: 'Cart' }).click();

        await expect(page.getByRole('heading', { name: 'Cart Summary' })).toBeVisible();
        await expect(page.getByText('Total | Checkout | Payment')).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Total : $' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Please Login to checkout' })).toBeVisible();
    });

    test('Without any log in and an empty cart, upon clicking to login to checkout button, user is directed to login page', async ({ page }) => {
        await page.getByRole('link', { name: 'Cart' }).click();
        await page.getByRole('button', { name: 'Please Login to checkout' }).click();

        // navigated to login page
        await expect(page.getByRole('heading', { name: 'LOGIN FORM' })).toBeVisible();
    });


    test('Without any log in, add 2 items to cart from the home page, access cart page and verify correct greeting is displayed.', async ({ page }) => {
        // add 2 items to cart
        await page.locator('.card-name-price > button:nth-child(2)').first().click();
        await page.locator('div:nth-child(2) > .card-body > div:nth-child(3) > button:nth-child(2)').click();

        // navigate to cart page
        await page.getByRole('link', { name: 'Cart' }).click();

        // correct greeting
        await expect(page.getByRole('heading', { name: 'Hello Guest You Have 2 items' })).toBeVisible();
    });

    test('Without any log in, add 2 items to cart from the home page, access cart page and verify correct cart summary is displayed.', async ({ page }) => {
        // add 2 items to cart
        await page.locator('.card-name-price > button:nth-child(2)').first().click();
        await page.locator('div:nth-child(2) > .card-body > div:nth-child(3) > button:nth-child(2)').click();

        // navigate to cart page
        await page.getByRole('link', { name: 'Cart' }).click();
        
        // correct summary
        await expect(page.getByRole('heading', { name: 'Cart Summary' })).toBeVisible();
        await expect(page.getByText('Total | Checkout | Payment')).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Total : $' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Please Login to checkout' })).toBeVisible();
    });

    test('Without any log in, add 2 items to cart from the home page, access cart page and verify items are correctly reflected in cart.', async ({ page }) => {
        // add 2 items to cart
        await page.locator('.card-name-price > button:nth-child(2)').first().click();
        await page.locator('div:nth-child(2) > .card-body > div:nth-child(3) > button:nth-child(2)').click();

        // navigate to cart page
        await page.getByRole('link', { name: 'Cart' }).click();

        // correct items
        await expect(page.getByText('Name : The Law of Contract in')).toBeVisible();
        await expect(page.getByText('Name : Novel')).toBeVisible();

    });

    test('Without any log in, add 2 items to cart from the home page, access cart page, then remove 1 item from cart page and verify greeting is correctly updated.', async ({ page }) => {
       // add 2 items to cart
        await page.locator('.card-name-price > button:nth-child(2)').first().click();
        await page.locator('div:nth-child(2) > .card-body > div:nth-child(3) > button:nth-child(2)').click();

        // navigate to cart page
        await page.getByRole('link', { name: 'Cart' }).click();
        // verify that there were 2 items originally in cart
        await expect(page.getByRole('heading', { name: 'Hello Guest You Have 2 items' })).toBeVisible();
        
        // remove an item
        await page.getByRole('button', { name: 'Remove' }).nth(1).click();

        // assert that theres only 1 item remaining
        await expect(page.getByRole('heading', { name: 'Hello Guest You Have 1 items' })).toBeVisible();
    });
});
