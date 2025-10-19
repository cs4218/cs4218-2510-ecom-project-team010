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

test.describe('Authenticated User Cart Flow', () => {

  // Before each test, register and log in a new user.
  // This provides a clean, authenticated state for every test.
  test.beforeEach(async ({ page }) => {
    const uniqueEmail = `cart_test_${Date.now()}@example.com`;
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

  test('should display a personalized empty cart message', async ({ page }) => {
    // GIVEN: A logged-in user with an empty cart.
    // WHEN: The user navigates to the cart page.
    await page.getByRole('link', { name: 'Cart' }).click();

    // THEN: The greeting should be personalized and state the cart is empty.
    await expect(page.getByRole('heading', { name: `Hello ${testUser.name}` })).toBeVisible();
    await expect(page.getByText('Your Cart Is Empty')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Total : $0.00' })).toBeVisible();
  });

  test('should add items to the cart and display them correctly', async ({ page }) => {
    // GIVEN: A logged-in user is on the homepage.
    // WHEN: The user adds two items to the cart.
    // Using robust locators to find products by name and then the button.
    await page.locator('.card').filter({ hasText: 'The Law of Contract' }).getByRole('button', { name: 'ADD TO CART' }).click();
    await page.locator('.card').filter({ hasText: 'Novel' }).getByRole('button', { name: 'ADD TO CART' }).click();
    
    // AND navigates to the cart page.
    await page.getByRole('link', { name: 'Cart' }).click();

    // THEN: The cart should display a personalized greeting with the correct item count.
    await expect(page.getByRole('heading', { name: `Hello ${testUser.name}` })).toBeVisible();
    await expect(page.getByText(`You Have 2 items in your cart`)).toBeVisible();

    // AND the items should be listed in the cart.
    await expect(page.getByText('Name : The Law of Contract in')).toBeVisible();
    await expect(page.getByText('Name : Novel')).toBeVisible();
  });

  test('should update the cart correctly after removing an item', async ({ page }) => {
    // GIVEN: A logged-in user with two items in their cart.
    await page.goto(BASE_URL);
    await page.locator('.card').filter({ hasText: 'The Law of Contract' }).getByRole('button', { name: 'ADD TO CART' }).click();
    await page.locator('.card').filter({ hasText: 'Novel' }).getByRole('button', { name: 'ADD TO CART' }).click();
    await page.getByRole('link', { name: 'Cart' }).click();
    await expect(page.getByText(`You Have 2 items in your cart`)).toBeVisible();

    // WHEN: The user removes one item from the cart.
    await page.locator('.card.flex-row').filter({ hasText: 'Novel' }).getByRole('button', { name: 'Remove' }).click();

    // THEN: The item count in the greeting should update to 1.
    await expect(page.getByText(`You Have 1 items in your cart`)).toBeVisible();
    
    // AND the removed item should no longer be visible.
    await expect(page.getByText('Name : Novel')).not.toBeVisible();
    
    // AND the remaining item should still be visible.
    await expect(page.getByText('Name : The Law of Contract in')).toBeVisible();
  });

  test('should show current address and enabled payment button for checkout', async ({ page }) => {
    // GIVEN: A logged-in user with an item in the cart and a registered address.
    // Mock the Braintree token API to ensure the payment form loads.

    await page.goto(BASE_URL);
    await page.locator('.card').filter({ hasText: 'Novel' }).getByRole('button', { name: 'ADD TO CART' }).click();

    // WHEN: The user navigates to the cart page.
    await page.getByRole('link', { name: 'Cart' }).click();

    // THEN: The user's current address should be displayed.
    await expect(page.getByRole('heading', { name: 'Current Address' })).toBeVisible();
    await expect(page.getByRole('heading', { name: testUser.address })).toBeVisible();

    // AND the "Make Payment" button should be visible and enabled.
    const makePaymentButton = page.getByRole('button', { name: 'Make Payment' });
    await expect(makePaymentButton).toBeVisible();
    await expect(makePaymentButton).toBeEnabled();
  });

  test('should allow user to navigate to profile page to update address', async ({ page }) => {
    // GIVEN: A logged-in user is on the cart page.
    await page.goto(`${BASE_URL}/cart`);

    // WHEN: The user clicks the "Update Address" button.
    await page.getByRole('button', { name: 'Update Address' }).click();

    // THEN: The user should be redirected to their profile page.
    await expect(page).toHaveURL(`${BASE_URL}/dashboard/user/profile`);
    await expect(page.getByRole('heading', { name: 'user profile' })).toBeVisible();
  });

  test('should correctly calculate and update the total price', async ({ page }) => {
    // GIVEN: A logged-in user on the homepage. (Assuming "Novel" is $29.99 and "The Law of Contract" is $59.99)
    await page.goto(BASE_URL);

    // WHEN: The user adds two specific items to the cart.
    await page.locator('.card').filter({ hasText: 'Novel' }).getByRole('button', { name: 'ADD TO CART' }).click();
    await page.locator('.card').filter({ hasText: 'The Law of Contract' }).getByRole('button', { name: 'ADD TO CART' }).click();
    await page.getByRole('link', { name: 'Cart' }).click();
    
    // THEN: The total price should be correctly calculated and displayed.
    await expect(page.getByRole('heading', { name: 'Total : $69.98' })).toBeVisible();

    // WHEN: The user removes one item.
    await page.locator('.card.flex-row').filter({ hasText: 'Novel' }).getByRole('button', { name: 'Remove' }).click();
    
    // THEN: The total price should update correctly.
    await expect(page.getByRole('heading', { name: 'Total : $54.99' })).toBeVisible();
  });

  test('should persist cart items after a page reload', async ({ page }) => {
    // GIVEN: A logged-in user adds an item to the cart.
    await page.goto(BASE_URL);
    await page.locator('.card').filter({ hasText: 'Novel' }).getByRole('button', { name: 'ADD TO CART' }).click();
    await page.getByRole('link', { name: 'Cart' }).click();
    await expect(page.getByText('Name : Novel')).toBeVisible();

    // WHEN: The user reloads the page.
    await page.reload();

    // THEN: The item should still be in the cart.
    await expect(page.getByRole('heading', { name: `Hello ${testUser.name}` })).toBeVisible();
    await expect(page.getByText(`You Have 1 items in your cart`)).toBeVisible();
    await expect(page.getByText('Name : Novel')).toBeVisible();
  });
});
