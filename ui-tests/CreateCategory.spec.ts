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

    // navigate to admin create category page 
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await page.getByRole('link', { name: 'Create Category' }).click();
}); 

test.describe("Create Category Page", () => {
    test("should render correct metadata and elements", async ({page}) => {
        await expect(page.getByRole('textbox', { name: 'Enter new category' })).toBeVisible(); 
        await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible(); 

        // assert that all current categories show up 
        await expect(page.getByRole('cell', { name: 'Electronics' })).toBeVisible(); 
        await expect(page.getByRole('cell', { name: 'Book' })).toBeVisible(); 
        await expect(page.getByRole('cell', { name: 'Clothing' })).toBeVisible(); 
    });

    test("should render newly added category successfully", async ({page}) => {
        await page.getByRole('link', { name: 'Create Category' }).click();
        await page.getByRole('textbox', { name: 'Enter new category' }).click();
        await page.getByRole('textbox', { name: 'Enter new category' }).fill('hello');
        await page.getByRole('button', { name: 'Submit' }).click();

        // assert that new category gets rendered
        await expect(page.getByRole('cell', { name: 'hello' })).toBeVisible();

        // cleanup 
        await page.getByRole('button', { name: 'Delete' }).nth(3).click();
    });

    test("should edit category successfully", async ({page}) => {
        await page.getByRole('link', { name: 'Create Category' }).click();
        await page.getByRole('textbox', { name: 'Enter new category' }).click();
        await page.getByRole('textbox', { name: 'Enter new category' }).fill('hello');
        await page.getByRole('button', { name: 'Submit' }).click();

        // assert that category exists 
        await expect(page.getByRole('cell', { name: 'Electronics' })).toBeVisible();

        // edit category 
        await page.getByRole('button', { name: 'Edit' }).first().click();
        await page.getByRole('dialog').getByRole('textbox', { name: 'Enter new category' }).click();
        await page.getByRole('dialog').getByRole('textbox', { name: 'Enter new category' }).fill('Electronics Or Smth');
        await page.getByRole('dialog').getByRole('button', { name: 'Submit' }).click();

        // assert that category gets updated
        await expect(page.getByRole('cell', { name: 'Electronics Or Smth' })).toBeVisible();

        // cleanup 
        await page.getByRole('button', { name: 'Edit' }).first().click();
        await page.getByRole('dialog').getByRole('textbox', { name: 'Enter new category' }).click();
        await page.getByRole('dialog').getByRole('textbox', { name: 'Enter new category' }).fill('Electronics');
        await page.getByRole('dialog').getByRole('button', { name: 'Submit' }).click();
    });
});