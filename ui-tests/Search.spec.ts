import { test, expect } from "@playwright/test";

const BASE = 'http://localhost:3000';

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

test.describe("Search Bar", () => {
    test("should render search bar on home page", async ({page}) => {
        await expect(page.getByRole('searchbox', { name: 'Search' })).toBeVisible(); 
        await expect(page.getByRole('button', { name: 'Search' })).toBeVisible(); 
    });

    test("should render the correct page after search", async ({page}) => {
        await page.getByRole('searchbox', { name: 'Search' }).click();
        await page.getByRole('searchbox', { name: 'Search' }).fill('no');
        await page.getByRole('button', { name: 'Search' }).click();

        // asserts that navigation to search happens 
        await page.waitForURL(/.*\/search.*/);
        expect(page.url()).toContain('/search');
        
        // asserts that result matches search 
        await expect(page.getByRole('heading', { name: 'Novel' })).toBeVisible();
    });

    test("should render the correct metadata and base elements after search", async ({page}) => {
        await page.goto(`${BASE}/search`);
    
        await expect(page).toHaveTitle(/Search results/i);        
        await expect(page.getByRole('heading', { name: 'Search Results', level: 1 })).toBeVisible();
    });
});