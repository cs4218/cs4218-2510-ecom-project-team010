import { test, expect } from '@playwright/test';

// ensures that test run reliably with the database being updated one test at a time
test.describe.configure({ mode: 'serial' });

const generateUniqueEmail = () => `adminUser_${Date.now()}_${Math.floor(Math.random() * 1000)}@example.com`;

test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('althea@gmail.com');
    await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('althea');
    await page.getByRole('button', { name: 'LOGIN' }).click();
    await page.getByRole('button', { name: 'althea' }).click();
    await page.getByRole('link', { name: 'Dashboard' }).click();
});

test.describe('UI testing Admin View Users page', () => {
    test('upon login as admin -> successfully navigate to users page -> heading is rendered', async ({ page }) => {
        await page.getByRole('link', { name: 'Users' }).click();
        await expect(page.getByRole('heading', { name: 'All User' })).toBeVisible();
    });

    test('upon login as admin -> successfully navigate to users page -> should render proper layout of page with navbar and footer', async ({ page }) => {
        await expect(page.getByRole('navigation')).toBeVisible();
        await expect(page.getByText('All Rights Reserved © TestingCompAbout|Contact|Privacy Policy')).toBeVisible();
    });

    test('login as admin -> navigate to Users in AdminMenu -> logout and create new user -> login as admin -> should see new user in Users in AdminMenu', async ({ page }) => {
        const uniqueEmail = generateUniqueEmail();

        // Ensure Users in AdminMenu exists 
        await expect(page.getByRole('main')).toContainText('Users');
        await expect(page.getByRole('main')).toMatchAriaSnapshot(`- link "Users"`);

        // Navigate to Admin View users 
        await page.getByRole('link', { name: 'Users' }).click();

        await expect(page).toHaveURL(/\/users$/);
        await expect(page.locator('h1')).toMatchAriaSnapshot(`- heading "All Users" [level=1]`);

        // New user that we are going to create does not exist
        await expect(page.locator('tbody')).not.toContainText(uniqueEmail);

        // Logout from admin account
        await page.getByRole('button', { name: 'althea' }).click();
        await page.getByRole('link', { name: 'Logout' }).click();

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

        // Login as admin
        await page.getByRole('link', { name: 'Login' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('althea@gmail.com');
        await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('althea');
        await page.getByRole('button', { name: 'LOGIN' }).click();

        // Navigate to Admin Dashboard --> Users tab in AdminMenu
        await page.getByRole('button', { name: 'althea' }).click();
        await page.getByRole('link', { name: 'Dashboard' }).click();
        await page.getByRole('link', { name: 'Users' }).click();

        // Should have a new row for the new user created
        await expect(page.locator('tbody')).toContainText('newUser');
        await expect(page.locator('tbody')).toContainText(uniqueEmail);
        await expect(page.locator('tbody')).toContainText('812345678');
        await expect(page.locator('tbody')).toContainText('newuser street');
        await expect(page.locator('tbody')).toMatchAriaSnapshot(`- cell "User"`);
    });
})