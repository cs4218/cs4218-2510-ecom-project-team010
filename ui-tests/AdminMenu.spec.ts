import { test, expect } from '@playwright/test';

// ensures that test run reliably with the database being updated one test at a time
test.describe.configure({ mode: 'serial' });

const generateUniqueEmail = () => `adminDashboard_${Date.now()}_${Math.floor(Math.random() * 1000)}@example.com`;

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

test.describe('UI testing admin menu page', () => {
    test('login as admin -> navigate to dashboard -> click create category on AdminMenu -> navigates to create category', async ({ page }) => {
        await expect(page.getByRole('main')).toContainText('Create Category');
        await expect(page.getByRole('main')).toMatchAriaSnapshot(`- link "Create Category"`);

        await page.getByRole('link', { name: 'Create Category' }).click();

        await expect(page).toHaveURL(/\/create-category$/);
        await expect(page.getByRole('main')).toMatchAriaSnapshot(`- link "Create Category"`);
        await expect(page.locator('h1')).toContainText('Manage Category');
    });

    test('login as admin -> navigate to dashboard -> click create product on AdminMenu -> navigates to create product', async ({ page }) => {
        await expect(page.getByRole('main')).toContainText('Create Product');
        await expect(page.getByRole('main')).toMatchAriaSnapshot(`- link "Create Product"`);

        await page.getByRole('link', { name: 'Create Product' }).click();

        await expect(page).toHaveURL(/\/create-product$/);
        await expect(page.getByRole('main')).toMatchAriaSnapshot(`- link "Create Product"`);
        await expect(page.locator('h1')).toContainText('Create Product');
    });

    test('login as admin -> navigate to dashboard -> click products on AdminMenu -> navigates to product', async ({ page }) => {
        await expect(page.getByRole('main')).toContainText('Products');
        await expect(page.getByRole('main')).toMatchAriaSnapshot(`- link "Products"`);

        await page.getByRole('link', { name: 'Products' }).click();

        await expect(page).toHaveURL(/\/products$/);
        await expect(page.getByRole('main')).toMatchAriaSnapshot(`- link "Products"`);
        await expect(page.locator('h1')).toContainText('Products');
    });

    test('login as admin -> navigate to dashboard -> click orders on AdminMenu -> navigates to orders', async ({ page }) => {
        await expect(page.getByRole('main')).toContainText('Orders');
        await expect(page.getByRole('main')).toMatchAriaSnapshot(`- link "Orders"`);

        await page.getByRole('link', { name: 'Orders' }).click();

        await expect(page).toHaveURL(/\/orders$/);
        await expect(page.getByRole('main')).toMatchAriaSnapshot(`- link "Orders"`);
        await expect(page.locator('h1')).toContainText('Orders');
    });

    test('login as admin -> navigate to dashboard -> click users on AdminMenu -> navigates to users', async ({ page }) => {
        await expect(page.getByRole('main')).toContainText('Users');
        await expect(page.getByRole('main')).toMatchAriaSnapshot(`- link "Users"`);

        await page.getByRole('link', { name: 'Users' }).click();

        await expect(page).toHaveURL(/\/users$/);
        await expect(page.getByRole('main')).toMatchAriaSnapshot(`- link "Users"`);
        await expect(page.locator('h1')).toContainText('Users');
    });
})