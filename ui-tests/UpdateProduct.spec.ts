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

    // navigate to admin products page 
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await page.getByRole('link', { name: 'Products' }).click();
}); 

test.describe("Update Product Page", () => {
    test("should navigate to update product page", async ({page}) => {
        await page.getByRole('link', { name: 'Products' }).click();
        await page.getByRole('link', { name: 'Novel Novel A bestselling' }).click();

        // asserts that we are in the update product page
        await page.waitForURL(/.*\/product.*/);
        expect(page.url()).toContain('/Novel');
    });  

    test("product page -> click card -> update product page -> update category -> updated product appears correctly on filtered categories", async ({page}) => {
        // navigate to update product page 
        await page.getByRole('link', { name: 'Products' }).click();
        await page.getByRole('link', { name: 'Novel Novel A bestselling' }).click();

        // update category 
        await page.getByTitle('Book').click();
        await page.getByTitle('Electronics').locator('div').click();
        await page.getByRole('button', { name: 'UPDATE PRODUCT' }).click();

        // navigate to category filter page
        await page.getByRole('link', { name: 'Categories' }).click();
        await page.getByRole('link', { name: 'Electronics' }).click();

        // assert that the product can be found in a new category
        await expect(page.getByRole('heading', { name: 'Novel' })).toBeVisible();

        // cleanup 
        await page.getByRole('button', { name: 'janna' }).click();
        await page.getByRole('link', { name: 'Dashboard' }).click();
        await page.getByRole('link', { name: 'Products' }).click();
        await page.getByRole('link', { name: 'Novel Novel A bestselling' }).click();
        await page.getByTitle('Electronics').click();
        await page.getByTitle('Book').locator('div').click();
        await page.getByRole('button', { name: 'UPDATE PRODUCT' }).click();
    });  

    test("product page -> click card -> update product page -> update price -> updated price is reflected on home page", async ({page}) => {
        // navigate to update product page 
        await page.getByRole('link', { name: 'Products' }).click();
        await page.getByRole('link', { name: 'Novel Novel A bestselling' }).click();

        // update price
        await page.getByPlaceholder('Product Price').click();
        await page.getByPlaceholder('Product Price').fill('16');
        await page.getByRole('button', { name: 'UPDATE PRODUCT' }).click();

        // verify that price is updated on the home page 
        await page.getByRole('link', { name: 'Home' }).click();
        await expect(page.getByRole('heading', { name: '$16.00' })).toBeVisible(); 

        // cleanup
        await page.getByRole('button', { name: 'janna' }).click();
        await page.getByRole('link', { name: 'Dashboard' }).click();
        await page.getByRole('link', { name: 'Products' }).click();
        await page.getByRole('link', { name: 'Novel Novel A bestselling' }).click();
        await page.getByPlaceholder('Product Price').click();
        await page.getByPlaceholder('Product Price').fill('14.99');
    });  

    test("product page -> click card -> update product page -> update to empty name -> product is not updated on home page", async ({page}) => {
        // navigate to update product page 
        await page.getByRole('link', { name: 'Products' }).click();
        await page.getByRole('link', { name: 'Novel Novel A bestselling' }).click();

        // update name to empty string, which is invalid
        await page.getByRole('textbox', { name: 'Product Name' }).click();
        await page.getByRole('textbox', { name: 'Product Name' }).fill('');
        await page.getByRole('button', { name: 'UPDATE PRODUCT' }).click();

        // verify that no update is done, i.e. full name is rendered on the home page 
        await page.getByRole('link', { name: 'Home' }).click();
        await expect(page.getByRole('heading', { name: 'Novel' })).toBeVisible(); 
    });  

    test("product page -> click card -> update product page -> update to empty name -> product is not updated on products page -> update product page renders full name", async ({page}) => {
        // navigate to update product page 
        await page.getByRole('link', { name: 'Products' }).click();
        await page.getByRole('link', { name: 'Novel Novel A bestselling' }).click();

        // update name to empty string, which is invalid
        await page.getByRole('textbox', { name: 'Product Name' }).click();
        await page.getByRole('textbox', { name: 'Product Name' }).fill('');
        await page.getByRole('button', { name: 'UPDATE PRODUCT' }).click();

        // verify that no update is done on products page and the next load of update product still renders the full name
        await page.getByRole('link', { name: 'Products' }).click();
        await page.getByRole('link', { name: 'Novel Novel A bestselling' }).click();
        await expect(page.getByRole('textbox', { name: 'Product Name' })).toHaveValue('Novel')
    }); 
});