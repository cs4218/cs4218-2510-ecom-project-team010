import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

// ensures that test run reliably with the database being updated one test at a time
test.describe.configure({ mode: 'serial' });

test.beforeEach(async ({ page }) => {
    //navigate to home page
    await page.goto('http://localhost:3000/');

    /// login into test admin account
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('jannaleong7@gmail.com');
    await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('123');
    await page.getByRole('button', { name: 'LOGIN' }).click();
    await page.getByRole('button', { name: 'janna' }).click();

    // navigate to admin product page
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await page.getByRole('link', { name: 'Products' }).click();
});

test.describe('Products List', () => {
  test('upon login as admin -> products page -> heading is rendered', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'All Products List' })).toBeVisible();
  });
  
  test('upon login as admin -> products page -> should render cards for each product as clickable links with product and description', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Novel Novel A bestselling' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'The Law of Contract in' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'NUS T-shirt NUS T-shirt Plain' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Smartphone Smartphone A high-' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Laptop Laptop A powerful' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Textbook Textbook A' })).toBeVisible();
  });

  test('upon login as admin -> products page -> should render proper layout of page with navbar and footer', async ({ page }) => {
      await expect(page.getByRole('navigation')).toBeVisible();
      await expect(page.getByText('All Rights Reserved © TestingCompAbout|Contact|Privacy Policy')).toBeVisible();
  });

  test('product page -> click card -> update product page -> edit title -> changed title reflected on product page', async ({ page }) => {
    // access update product page for item
    await page.getByRole('link', { name: 'Products' }).click();
    await page.getByRole('link', { name: 'Novel Novel A bestselling' }).click();

    // update product title
    await page.getByRole('textbox', { name: 'Product Name' }).click();
    await page.getByRole('textbox', { name: 'Product Name' }).fill('Not Novel');
    await page.getByRole('button', { name: 'UPDATE PRODUCT' }).click();

    // assert that new title name change is reflect on product page
    await expect(page.getByRole('link', { name: 'Not Novel Not Novel A' })).toBeVisible();
    
    // clean up and reset product title to reset test environment
    await page.getByRole('link', { name: 'Not Novel Not Novel A' }).click();
    await page.getByRole('textbox', { name: 'Product Name' }).click();
    await page.getByRole('textbox', { name: 'Product Name' }).fill('Novel');
    await page.getByRole('button', { name: 'UPDATE PRODUCT' }).click();
    await expect(page.getByRole('link', { name: 'Novel Novel A bestselling' })).toBeVisible();

  });

  test('product page -> click card -> update product page -> edit description -> changed description is reflected on product page', async ({ page }) => {
    // access update product page for item
    await page.getByRole('link', { name: 'Products' }).click();
    await page.getByRole('link', { name: 'Novel Novel A bestselling' }).click();

    // update product description
    await page.getByRole('textbox', { name: 'Product Description' }).click();
    await page.getByRole('textbox', { name: 'Product Description' }).click();
    await page.getByRole('textbox', { name: 'Product Description' }).fill('A poorselling novel');
    await page.getByRole('button', { name: 'UPDATE PRODUCT' }).click();

    // assert that new description is reflected on product page
    await expect(page.getByRole('link', { name: 'Novel Novel A poorselling' })).toBeVisible();

    // clean up and reset product description to reset test environment
    await page.getByRole('link', { name: 'Novel Novel A poorselling' }).click();
    await page.getByRole('textbox', { name: 'Product Description' }).click();
    await page.getByRole('textbox', { name: 'Product Description' }).fill('A bestselling novel');
    await page.getByRole('button', { name: 'UPDATE PRODUCT' }).click();
    await expect(page.getByRole('link', { name: 'Novel Novel A bestselling' })).toBeVisible();

  });

  test('create product on create product page -> product page -> new product card is rendered with correct contents', async ({ page }) => {
    // go to Create Product page
    await page.getByRole('link', { name: 'Create Product' }).click();

    // create new product
    const uniqueName = `Harry Potter`;
    await page.locator('#rc_select_0').click();               
    await page.getByText('Book').nth(1).click();
    await page.getByRole('textbox', { name: 'Product Name' }).fill(uniqueName);
    await page.getByRole('textbox', { name: 'Product Description' }).fill('A magical book');
    await page.getByPlaceholder('Product Price').fill('10');
    await page.getByPlaceholder('Product Quantity').fill('20');
    await page.locator('#rc_select_1').click();               
    await page.getByText('Yes', { exact: true }).click();
    await page.getByRole('button', { name: 'CREATE PRODUCT' }).click();

    // assert that correct product card was created
    await page.getByRole('link', { name: 'Products' }).click();
    await expect(page.getByRole('link', { name: 'Harry Potter Harry Potter A' })).toBeVisible();

    // clean up and delete product to reset test environment
    await page.getByRole('link', { name: 'Harry Potter Harry Potter A' }).click();
    page.once('dialog', async (dialog) => {
      await dialog.accept();
    });
    await page.getByRole('button', { name: 'DELETE PRODUCT' }).click();
  });

});
