import { test, expect } from "@playwright/test";

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

        // assert that all current categories show up 
        await expect(page.getByRole('cell', { name: 'Electronics' })).toBeVisible(); 
        await expect(page.getByRole('cell', { name: 'Book' })).toBeVisible(); 
        await expect(page.getByRole('cell', { name: 'Clothing' })).toBeVisible(); 
    });

    test("create category page -> fill in new field -> click update -> new category appears on the page -> delete category -> category is not on the page and dropdown", async ({page}) => {
        await page.getByRole('link', { name: 'Create Category' }).click();
        await page.getByRole('textbox', { name: 'Enter new category' }).click();
        await page.getByRole('textbox', { name: 'Enter new category' }).fill('hello');
        await page.getByRole('button', { name: 'Submit' }).click();

        // assert that new category gets rendered on the CreateCategory page
        await expect(page.getByRole('cell', { name: 'hello' })).toBeVisible();

        // cleanup 
        await page.getByRole('button', { name: 'Delete' }).nth(3).click();

        // expect that it is no longer rendered on the CreateCategory page
        await expect(page.getByRole('cell', { name: 'hello' })).not.toBeVisible();
        
        // expect that it is no longer rendered on the category dropdown component
        await page.getByRole('link', { name: 'Categories' }).click();
        await page.getByRole('link', { name: 'All Categories' }).click();
        await page.waitForURL(/.*\/categories.*/);
        await expect(page.getByRole('link', { name: 'hello' })).not.toBeVisible();
    });

    test("create category page -> click edit -> update fields -> edited category appears on the page", async ({page}) => {
        await page.getByRole('link', { name: 'Create Category' }).click();

        // assert that category exists 
        await expect(page.getByRole('cell', { name: 'Electronics' })).toBeVisible();

        // edit category 
        await page.getByRole('button', { name: 'Edit' }).first().click();
        await page.getByRole('dialog').getByRole('textbox', { name: 'Enter new category' }).click();
        await page.getByRole('dialog').getByRole('textbox', { name: 'Enter new category' }).fill('Electronics Or Smth');
        await page.getByRole('dialog').getByRole('button', { name: 'Submit' }).click();

        // assert that category gets updated on the CreateCategory page
        await expect(page.getByRole('cell', { name: 'Electronics Or Smth' })).toBeVisible();

        // cleanup 
        await page.getByRole('button', { name: 'Edit' }).first().click();
        await page.getByRole('dialog').getByRole('textbox', { name: 'Enter new category' }).click();
        await page.getByRole('dialog').getByRole('textbox', { name: 'Enter new category' }).fill('Electronics');
        await page.getByRole('dialog').getByRole('button', { name: 'Submit' }).click();
        page.getByRole('cell', { name: 'Electronics' });
    });

    test("create category page -> click edit -> update fields -> edited category appears on the category dropdown", async ({page}) => {
        await page.getByRole('link', { name: 'Create Category' }).click();

        // assert that category exists 
        await expect(page.getByRole('cell', { name: 'Book' })).toBeVisible();

        // edit category 
        await page.getByRole('button', { name: 'Edit' }).nth(1).click();
        await page.getByRole('dialog').getByRole('textbox', { name: 'Enter new category' }).click();
        await page.getByRole('dialog').getByRole('textbox', { name: 'Enter new category' }).fill('B Or Smth');
        await page.getByRole('dialog').getByRole('button', { name: 'Submit' }).click();

        // assert that category gets updated on the category dropdown component
        await page.getByRole('link', { name: 'Categories' }).click();
        await page.getByRole('link', { name: 'All Categories' }).click();
        await page.waitForURL(/.*\/categories.*/);
        await expect(page.getByRole('link', { name: 'B Or Smth' })).toBeVisible();

        // cleanup 
        await page.getByRole('button', { name: 'janna' }).click();
        await page.getByRole('link', { name: 'Dashboard' }).click();
        await page.getByRole('link', { name: 'Create Category' }).click();
        await page.getByRole('button', { name: 'Edit' }).nth(1).click();
        await page.getByRole('dialog').getByRole('textbox', { name: 'Enter new category' }).click();
        await page.getByRole('dialog').getByRole('textbox', { name: 'Enter new category' }).fill('Book');
        await page.getByRole('dialog').getByRole('button', { name: 'Submit' }).click();
        page.getByRole('cell', { name: 'Book' });
    });
});