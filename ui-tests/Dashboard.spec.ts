import { test, expect } from '@playwright/test';

// ensures that test run reliably with the database being updated one test at a time
test.describe.configure({ mode: 'serial' });

const generateUniqueEmail = () => `testuser_${Date.now()}_${Math.floor(Math.random() * 1000)}@example.com`;

test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/');
});

test.describe('UI testing user dashboard page', () => {
    test('login -> navigate to dashboard -> renders side card with user details', async ({ page }) => {
        const uniqueEmail = generateUniqueEmail()

        // Register a new user
        await page.getByRole('link', { name: 'Register' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Name' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Name' }).fill('newuser');
        await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(uniqueEmail);
        await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('newuser');
        await page.getByRole('textbox', { name: 'Enter Your Phone' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Phone' }).fill('812345678');
        await page.getByRole('textbox', { name: 'Enter Your Address' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Address' }).fill('newuser street');
        await page.getByPlaceholder('Enter Your DOB').fill('1900-01-01');
        await page.getByRole('textbox', { name: 'What is Your Favorite sports' }).click();
        await page.getByRole('textbox', { name: 'What is Your Favorite sports' }).fill('newuser');
        await page.getByRole('button', { name: 'REGISTER' }).click();

        // Login 
        await page.getByRole('link', { name: 'Login' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(uniqueEmail);
        await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('newuser');
        await page.getByRole('button', { name: 'LOGIN' }).click();

        // Navigate to Dashboard
        await page.getByRole('button', { name: 'newuser' }).click();
        await page.getByRole('link', { name: 'Dashboard' }).click();

        // Assert: User information is displayed
        await expect(page.getByRole('main')).toContainText('newuser');
        await expect(page.getByRole('main')).toContainText(uniqueEmail);
        await expect(page.getByRole('main')).toContainText('newuser street');
    });

    test('login -> navigate to dashboard -> renders user menu', async ({ page }) => {
        const uniqueEmail = generateUniqueEmail()

        // Register a new user
        await page.getByRole('link', { name: 'Register' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Name' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Name' }).fill('newuser');
        await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(uniqueEmail);
        await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('newuser');
        await page.getByRole('textbox', { name: 'Enter Your Phone' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Phone' }).fill('812345678');
        await page.getByRole('textbox', { name: 'Enter Your Address' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Address' }).fill('newuser street');
        await page.getByPlaceholder('Enter Your DOB').fill('1900-01-01');
        await page.getByRole('textbox', { name: 'What is Your Favorite sports' }).click();
        await page.getByRole('textbox', { name: 'What is Your Favorite sports' }).fill('newuser');
        await page.getByRole('button', { name: 'REGISTER' }).click();

        // Login 
        await page.getByRole('link', { name: 'Login' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(uniqueEmail);
        await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('newuser');
        await page.getByRole('button', { name: 'LOGIN' }).click();

        // Navigate to Dashboard
        await page.getByRole('button', { name: 'newuser' }).click();
        await page.getByRole('link', { name: 'Dashboard' }).click();

        // Assert: UserMenu is rendered
        await expect(page.getByRole('main')).toContainText('Dashboard');
        await expect(page.getByRole('link', { name: 'Profile' })).toBeVisible();
        await expect(page.getByRole('main')).toContainText('Profile');
        await expect(page.getByRole('link', { name: 'Orders' })).toBeVisible();
        await expect(page.getByRole('main')).toContainText('Orders');
    });
})
