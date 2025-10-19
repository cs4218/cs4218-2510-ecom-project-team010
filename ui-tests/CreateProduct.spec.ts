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

    // navigate to admin create product page 
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await page.getByRole('link', { name: 'Create Product' }).click();
}); 

test.describe("Create Product Page", () => {
    test("should render correct metadata and elements", async ({page}) => {
        await expect(page.getByRole('heading', { name: 'Create Product' })).toBeVisible(); 
        await expect(page.getByText('Upload Photo')).toBeVisible(); 
        await expect(page.getByRole('textbox', { name: 'Product Name' })).toBeVisible(); 
        await expect(page.getByRole('textbox', { name: 'Product Description' })).toBeVisible(); 
        await expect(page.getByPlaceholder('Product Price')).toBeVisible(); 
        await expect(page.getByPlaceholder('Product Quantity')).toBeVisible(); 
        await expect(page.getByRole('button', { name: 'CREATE PRODUCT' })).toBeVisible(); 
    });

    test("create product page -> fill in product fields -> click submit -> new product card is rendered on products page", async ({page}) => {
        await page.getByRole('link', { name: 'Create Product' }).click();
        // create new product
        const newProductName = `New Froduct`;
        await page.locator('#rc_select_0').click();               
        await page.getByText('Book').nth(1).click();
        await page.getByRole('textbox', { name: 'Product Name' }).fill(newProductName);
        await page.getByRole('textbox', { name: 'Product Description' }).fill('A new book');
        await page.getByPlaceholder('Product Price').fill('6');
        await page.getByPlaceholder('Product Quantity').fill('7');
        await page.locator('#rc_select_1').click();               
        await page.getByText('Yes', { exact: true }).click();
        await page.getByRole('button', { name: 'CREATE PRODUCT' }).click();

        // assert that the new product is correctly rendered 
        await page.goto('http://localhost:3000/dashboard/admin/products');
        await expect(page.getByRole('link', { name: 'New Froduct New Froduct A new' })).toBeVisible();

        // cleanup 
        await page.getByRole('link', { name: 'New Froduct New Froduct A new' }).click();
        page.once('dialog', async dialog => {
            await dialog.accept();
        });
        await page.getByRole('button', { name: 'DELETE PRODUCT' }).click();
        await page.goto('http://localhost:3000/dashboard/admin/products');
        await page.waitForURL(/.*\/dashboard.*/);
        await expect(page.getByRole('heading', { name: 'Novel' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'New Froduct' })).not.toBeVisible();
    }); 

    test("create product page -> fill in product fields -> click submit -> new product card is rendered on home page", async ({page}) => {
        await page.getByRole('link', { name: 'Create Product' }).click();

        // create new product
        const newProductName = `New Produce`;
        await page.locator('#rc_select_0').click();               
        await page.getByText('Book').nth(1).click();
        await page.getByRole('textbox', { name: 'Product Name' }).fill(newProductName);
        await page.getByRole('textbox', { name: 'Product Description' }).fill('A new produce');
        await page.getByPlaceholder('Product Price').fill('6');
        await page.getByPlaceholder('Product Quantity').fill('7');
        await page.locator('#rc_select_1').click();               
        await page.getByText('Yes', { exact: true }).click();
        await page.getByRole('button', { name: 'CREATE PRODUCT' }).click();
        await page.waitForResponse(response => 
            response.url().includes('/api/v1/category') && response.status() === 200
        );

        // assert that the new product is correctly rendered 
        await page.getByRole('link', { name: 'Home' }).click();
        await page.goto('http://localhost:3000');
        await expect(page.getByRole('heading', { name: 'New Produce' })).toBeVisible();

        // cleanup 
        await page.goto('http://localhost:3000/dashboard/admin/products');
        await page.getByRole('link', { name: 'New Produce New Produce A new' }).click();
        page.once('dialog', async (dialog) => {
            await dialog.accept();
        });
        await page.getByRole('button', { name: 'DELETE PRODUCT' }).click();
        await page.goto('http://localhost:3000/dashboard/admin/products');
        await expect(page.getByRole('heading', { name: 'Novel' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'New Produce' })).not.toBeVisible();
    }); 

    test("create product page -> fill in only some product fields -> click submit -> no new product card is rendered on products page", async ({page}) => {
        await page.getByRole('link', { name: 'Create Product' }).click();

        // create new product but skip on filling product price and quantity, which are required 
        const newProductName = `New Product`;
        await page.locator('#rc_select_0').click();               
        await page.getByText('Book').nth(1).click();
        await page.getByRole('textbox', { name: 'Product Name' }).fill(newProductName);
        await page.getByRole('textbox', { name: 'Product Description' }).fill('A new book');
        await page.locator('#rc_select_1').click();               
        await page.getByText('Yes', { exact: true }).click();
        await page.getByRole('button', { name: 'CREATE PRODUCT' }).click();

        // assert that the no new product is rendered 
        await page.goto('http://localhost:3000/dashboard/admin/products');
        await page.waitForURL(/.*\/dashboard.*/);
        await expect(page.getByRole('link', { name: 'New Product New Product A new' })).not.toBeVisible();
    }); 
});