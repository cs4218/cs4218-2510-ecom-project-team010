import { test, expect } from "@playwright/test";

// ensures that test run reliably with the database being updated one test at a time
test.describe.configure({ mode: 'serial' });

test.beforeEach(async ({ page }) => {
    // navigate to home page
    await page.goto('http://localhost:3000/');

    // login into test admin account
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('jannaleong7@gmail.com');
    await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('123');
    await page.getByRole('button', { name: 'LOGIN' }).click();
    await page.getByRole('button', { name: 'janna' }).click();
}); 

test.describe("Categories Dropdown", () => {
    test("should render a dropdown bar for categories on home page", async ({page}) => {
        await expect(page.getByRole('link', { name: 'Categories' })).toBeVisible(); 
        await page.getByRole('link', { name: 'Categories' }).click();

        // assert that categories are loaded 
        expect(page.getByRole('link', { name: 'All Categories' }));
        expect(page.getByRole('link', { name: 'Electronics' }));
        expect(page.getByRole('link', { name: 'Book' }));
        expect(page.getByRole('link', { name: 'Clothing' }));
    });

    test("should navigate to the correct page after clicking on a category", async ({page}) => {
        await page.getByRole('link', { name: 'Categories' }).click();
        await page.getByRole('link', { name: 'Electronics' }).click();

        // asserts that navigation to navigation to electronics category happens  
        await page.waitForURL(/.*\/category.*/);
        expect(page.url()).toContain('/electronics');

        // asserts that result matches category selection 
        await expect(page.getByRole('heading', { name: 'Laptop' })).toBeVisible();
    });
});