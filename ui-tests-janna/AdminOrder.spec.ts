import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

const BASE = 'http://localhost:3000';

// ensures that test run reliably with the database being updated one test at a time
test.describe.configure({ mode: 'serial' });

test.beforeEach(async ({ page }) => {
    // act 
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
    await page.getByRole('link', { name: 'Orders' }).click();
});

test.describe('UI testing admin orders page.', () => {

  test('upon login as admin -> successfully navigate to orders page -> heading is rendered', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'All Orders' })).toBeVisible();
  });

  test('upon login as admin -> successfully navigate to orders page -> should render proper layout of page with navbar and footer', async ({ page }) => {
      await expect(page.getByRole('navigation')).toBeVisible();
      await expect(page.getByText('All Rights Reserved © TestingCompAbout|Contact|Privacy Policy')).toBeVisible();
  });

  test('upon login as admin -> successfully navigate to orders page -> status of orders are correctly rendered with proper headers', async ({ page }) => {
    // index 
    await expect(page.getByRole('columnheader', { name: '#' })).toBeVisible();
    await expect(page.getByRole('cell', { name: '1', exact: true })).toBeVisible();

    // order status 
    await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible();
    await expect(page.getByText('Not Processed')).toBeVisible();

    // user account
    await expect(page.getByRole('columnheader', { name: 'Buyer' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'CS 4218 Test Account' })).toBeVisible();

    // date column present -> did not assert exactly value because this value changes daily
    // leading to brittle test cases
    await expect(page.getByRole('columnheader', { name: 'Date' })).toBeVisible();

    // payment status
    await expect(page.getByRole('columnheader', { name: 'Payment' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Failed' })).toBeVisible();

    // quantity purchased 
    await expect(page.getByRole('columnheader', { name: 'Quantity' })).toBeVisible();
    await expect(page.getByRole('cell', { name: '3' })).toBeVisible();
  });

  test('upon login as admin -> orders page -> items ordered are correctly displayed for each order', async ({ page }) => {
    await expect(page.locator('div').filter({ hasText: /^Name: NUS T-shirtDescription: Plain NUS T-shirt for salePrice : 4\.99$/ }).first()).toBeVisible();
    await expect(page.locator('div').filter({ hasText: /^Name: LaptopDescription: A powerful laptopPrice : 1499\.99$/ }).first()).toBeVisible();
    await expect(page.locator('div').filter({ hasText: /^Name: LaptopDescription: A powerful laptopPrice : 1499\.99$/ }).nth(2)).toBeVisible();
  });
})


