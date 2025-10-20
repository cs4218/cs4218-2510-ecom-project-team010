import { test, expect } from '@playwright/test';

// ensures that test run reliably with the database being updated one test at a time
test.describe.configure({ mode: 'serial' });

test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('althea@gmail.com');
    await page.getByRole('textbox', { name: 'Enter Your Email' }).press('Tab');
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('althea');
    await page.getByRole('button', { name: 'LOGIN' }).click();
    await page.getByRole('button', { name: 'althea' }).click();
    await page.getByRole('link', { name: 'Dashboard' }).click();
});

test.describe('UI testing admin dashboard page', () => {
    test('login as admin -> navigate to dashboard -> renders side card with admin details', async ({ page }) => {
        await expect(page.getByRole('main')).toContainText('Admin Name : althea');
        await page.getByRole('heading', { name: 'Admin Email : althea@gmail.com' }).click();
        await expect(page.getByRole('main')).toContainText('Admin Email : althea@gmail.com');
        await expect(page.getByRole('main')).toContainText('Admin Contact : 91234567');
    });

    test('login as admin -> navigate to dashboard -> renders admin menu', async ({ page }) => {
        await expect(page.getByRole('main')).toContainText('Admin Panel');
        await expect(page.getByRole('main')).toContainText('Create Category');
        await expect(page.getByRole('main')).toContainText('Products');
        await expect(page.getByRole('main')).toContainText('Orders');
        await expect(page.getByRole('main')).toContainText('Users');
    });
})
