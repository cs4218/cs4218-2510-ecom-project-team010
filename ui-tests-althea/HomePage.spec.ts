import { test, expect } from '@playwright/test';

// ensures that test run reliably with the database being updated one test at a time
test.describe.configure({ mode: 'serial' });

const generateUniqueEmail = () => `homePage_${Date.now()}_${Math.floor(Math.random() * 1000)}@example.com`;

test.describe('UI testing Homepage', () => {
    test.describe('User logged in', () => {
        test.beforeEach(async ({ page }) => {
            const uniqueEmail = generateUniqueEmail()

            await page.goto('http://localhost:3000/');

            // Register a new account 
            await page.getByRole('link', { name: 'Register' }).click();
            await page.getByRole('textbox', { name: 'Enter Your Name' }).fill('tester');
            await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
            await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(uniqueEmail);
            await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
            await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('tester');
            await page.getByRole('textbox', { name: 'Enter Your Phone' }).click();
            await page.getByRole('textbox', { name: 'Enter Your Phone' }).fill('1234');
            await page.getByRole('textbox', { name: 'Enter Your Address' }).click();
            await page.getByRole('textbox', { name: 'Enter Your Address' }).fill('tester street');
            await page.getByPlaceholder('Enter Your DOB').fill('1900-01-01');
            await page.getByRole('textbox', { name: 'What is Your Favorite sports' }).click();
            await page.getByRole('textbox', { name: 'What is Your Favorite sports' }).fill('tester');
            await page.getByRole('button', { name: 'REGISTER' }).click();

            // Login the user 
            await page.getByRole('link', { name: 'Login' }).click();
            await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
            await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(uniqueEmail);
            await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
            await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('tester');
            await page.getByRole('button', { name: 'LOGIN' }).click();
        });

        test('new user login -> homepage loads with all products', async ({ page }) => {
            await expect(page.getByRole('main')).toMatchAriaSnapshot(`
                - img "Novel"
                - heading "Novel" [level=5]
                - heading /\\$\\d+\\.\\d+/ [level=5]
                - paragraph: A bestselling novel...
                - button "More Details"
                - button "ADD TO CART"
            `);
            await expect(page.getByRole('main')).toMatchAriaSnapshot(`
                - img "The Law of Contract in Singapore"
                - heading "The Law of Contract in Singapore" [level=5]
                - heading /\\$\\d+\\.\\d+/ [level=5]
                - paragraph: A bestselling book in Singapore...
                - button "More Details"
                - button "ADD TO CART"
            `);
            await expect(page.getByRole('main')).toMatchAriaSnapshot(`
                - img "NUS T-shirt"
                - heading "NUS T-shirt" [level=5]
                - heading /\\$\\d+\\.\\d+/ [level=5]
                - paragraph: Plain NUS T-shirt for sale...
                - button "More Details"
                - button "ADD TO CART"
            `);
            await expect(page.getByRole('main')).toMatchAriaSnapshot(`
                - img "Smartphone"
                - heading "Smartphone" [level=5]
                - heading /\\$\\d+\\.\\d+/ [level=5]
                - paragraph: A high-end smartphone...
                - button "More Details"
                - button "ADD TO CART"
            `);
            await expect(page.getByRole('main')).toMatchAriaSnapshot(`
                - img "Laptop"
                - heading "Laptop" [level=5]
                - heading /\\$\\d+,\\d+\\.\\d+/ [level=5]
                - paragraph: A powerful laptop...
                - button "More Details"
                - button "ADD TO CART"
            `);
            await expect(page.getByRole('main')).toMatchAriaSnapshot(`
                - heading "Textbook" [level=5]
                - heading /\\$\\d+\\.\\d+/ [level=5]
                - paragraph: A comprehensive textbook...
                - button "More Details"
                - button "ADD TO CART"
            `);
        });

        test('new user login -> homepage loads with all products -> filter by category only -> reset filters', async ({ page }) => {
            // Initial load -> all products should be present
            await expect(page.getByRole('main')).toContainText('Novel');
            await expect(page.getByRole('main')).toContainText('The Law of Contract in Singapore');
            await expect(page.getByRole('main')).toContainText('NUS T-shirt');
            await expect(page.getByRole('main')).toContainText('Smartphone');
            await expect(page.getByRole('main')).toContainText('Laptop');
            await expect(page.getByRole('main')).toContainText('Textbook');

            // Filter by Electronics only
            await page.getByRole('checkbox', { name: 'Electronics' }).check();
            await expect(page.getByRole('main')).toMatchAriaSnapshot(`
                - heading "Laptop" [level=5]
                - heading /\\$\\d+,\\d+\\.\\d+/ [level=5]
                - paragraph: A powerful laptop...
                - button "More Details"
                - button "ADD TO CART"
                `);
            await expect(page.getByRole('main')).toMatchAriaSnapshot(`
                - heading "Smartphone" [level=5]
                - heading /\\$\\d+\\.\\d+/ [level=5]
                - paragraph: A high-end smartphone...
                - button "More Details"
                - button "ADD TO CART"
                `);

            // Filter by both electronics and book
            await page.getByRole('checkbox', { name: 'Book' }).check();
            await expect(page.getByRole('main')).toMatchAriaSnapshot(`
                - heading "Textbook" [level=5]
                - heading /\\$\\d+\\.\\d+/ [level=5]
                - paragraph: A comprehensive textbook...
                - button "More Details"
                - button "ADD TO CART"
                `);
            await expect(page.getByRole('main')).toMatchAriaSnapshot(`
                - heading "Laptop" [level=5]
                - heading /\\$\\d+,\\d+\\.\\d+/ [level=5]
                - paragraph: A powerful laptop...
                - button "More Details"
                - button "ADD TO CART"
                `);
            await expect(page.getByRole('main')).toMatchAriaSnapshot(`
                - heading "Smartphone" [level=5]
                - heading /\\$\\d+\\.\\d+/ [level=5]
                - paragraph: A high-end smartphone...
                - button "More Details"
                - button "ADD TO CART"
                `);
            await expect(page.getByRole('main')).toMatchAriaSnapshot(`
                - img "Novel"
                - heading "Novel" [level=5]
                - heading /\\$\\d+\\.\\d+/ [level=5]
                - paragraph: A bestselling novel...
                - button "More Details"
                - button "ADD TO CART"
                `);
            await expect(page.getByRole('main')).toMatchAriaSnapshot(`
                - heading "The Law of Contract in Singapore" [level=5]
                - heading /\\$\\d+\\.\\d+/ [level=5]
                - paragraph: A bestselling book in Singapore...
                - button "More Details"
                - button "ADD TO CART"
                `);

            // Filter by book only 
            await page.getByRole('checkbox', { name: 'Electronics' }).uncheck();
            await expect(page.getByRole('main')).toMatchAriaSnapshot(`
                - heading "Textbook" [level=5]
                - heading /\\$\\d+\\.\\d+/ [level=5]
                - paragraph: A comprehensive textbook...
                - button "More Details"
                - button "ADD TO CART"
                `);
            await expect(page.getByRole('main')).toMatchAriaSnapshot(`
                - heading "Novel" [level=5]
                - heading /\\$\\d+\\.\\d+/ [level=5]
                - paragraph: A bestselling novel...
                - button "More Details"
                - button "ADD TO CART"
                `);
            await expect(page.getByRole('main')).toMatchAriaSnapshot(`
                - heading "The Law of Contract in Singapore" [level=5]
                - heading /\\$\\d+\\.\\d+/ [level=5]
                - paragraph: A bestselling book in Singapore...
                - button "More Details"
                - button "ADD TO CART"
                `);

            // RESET filter --> everything should show again 
            await page.locator('div').filter({ hasText: /^RESET FILTERS$/ }).click();
            await expect(page.getByRole('main')).toContainText('Novel');
            await expect(page.getByRole('main')).toContainText('The Law of Contract in Singapore');
            await expect(page.getByRole('main')).toContainText('NUS T-shirt');
            await expect(page.getByRole('main')).toContainText('Smartphone');
            await expect(page.getByRole('main')).toContainText('Laptop');
            await expect(page.getByRole('main')).toContainText('Textbook');
        });

        test('new user login -> homepage loads with all products -> filter by price only -> reset filters', async ({ page }) => {
            // Initial load -> all products should be present
            await expect(page.getByRole('main')).toContainText('Novel');
            await expect(page.getByRole('main')).toContainText('The Law of Contract in Singapore');
            await expect(page.getByRole('main')).toContainText('NUS T-shirt');
            await expect(page.getByRole('main')).toContainText('Smartphone');
            await expect(page.getByRole('main')).toContainText('Laptop');
            await expect(page.getByRole('main')).toContainText('Textbook');

            // Filter by price $0 to $20
            await page.getByRole('radio', { name: '$0 to' }).check();
            await expect(page.getByRole('main')).toMatchAriaSnapshot(`
                - img "Novel"
                - heading "Novel" [level=5]
                - heading /\\$\\d+\\.\\d+/ [level=5]
                - paragraph: A bestselling novel...
                - button "More Details"
                - button "ADD TO CART"
                `);
            await expect(page.getByRole('main')).toMatchAriaSnapshot(`
                - heading "NUS T-shirt" [level=5]
                - heading /\\$\\d+\\.\\d+/ [level=5]
                - paragraph: Plain NUS T-shirt for sale...
                - button "More Details"
                - button "ADD TO CART"
                `);

            // Filter by price $40 to $60
            await page.getByRole('radio', { name: '$40 to' }).check();
            await expect(page.getByRole('main')).toMatchAriaSnapshot(`
                - heading "The Law of Contract in Singapore" [level=5]
                - heading /\\$\\d+\\.\\d+/ [level=5]
                - paragraph: A bestselling book in Singapore...
                - button "More Details"
                - button "ADD TO CART"
                `);

            // Filter by price $ 100 or more
            await page.getByRole('radio', { name: '$100 or more' }).check();
            await expect(page.getByRole('main')).toMatchAriaSnapshot(`
                - heading "Laptop" [level=5]
                - heading /\\$\\d+,\\d+\\.\\d+/ [level=5]
                - paragraph: A powerful laptop...
                - button "More Details"
                - button "ADD TO CART"
                `);
            await expect(page.getByRole('main')).toMatchAriaSnapshot(`
                - heading "Smartphone" [level=5]
                - heading /\\$\\d+\\.\\d+/ [level=5]
                - paragraph: A high-end smartphone...
                - button "More Details"
                - button "ADD TO CART"
                `);

            // RESET filter --> everything should show again 
            await page.locator('div').filter({ hasText: /^RESET FILTERS$/ }).click();
            await expect(page.getByRole('main')).toContainText('Novel');
            await expect(page.getByRole('main')).toContainText('The Law of Contract in Singapore');
            await expect(page.getByRole('main')).toContainText('NUS T-shirt');
            await expect(page.getByRole('main')).toContainText('Smartphone');
            await expect(page.getByRole('main')).toContainText('Laptop');
            await expect(page.getByRole('main')).toContainText('Textbook');
        })

        test('new user login -> homepage loads with all products -> Click on more details -> -> Click on more details of similar product -> back home', async ({ page }) => {
            // Initial load -> all products should be present
            await expect(page.getByRole('main')).toContainText('Novel');
            await expect(page.getByRole('main')).toContainText('The Law of Contract in Singapore');
            await expect(page.getByRole('main')).toContainText('NUS T-shirt');
            await expect(page.getByRole('main')).toContainText('Smartphone');
            await expect(page.getByRole('main')).toContainText('Laptop');
            await expect(page.getByRole('main')).toContainText('Textbook');

            // Click on more details button of Novel 
            await page.locator('.card-name-price > button').first().click();

            await expect(page.locator('h1')).toContainText('Product Details');
            await expect(page.getByRole('main')).toContainText('Name : Novel');
            await expect(page.getByRole('main')).toContainText('Description : A bestselling novel');
            await expect(page.getByRole('main')).toContainText('Price :$14.99');
            await expect(page.getByRole('main')).toContainText('Category : Book');
            await expect(page.getByRole('main')).toMatchAriaSnapshot(`- button "ADD TO CART"`);
            await expect(page.getByRole('main')).toContainText('Similar Products ➡️');
            await expect(page.getByRole('main')).toContainText('Textbook$79.99');
            await expect(page.getByRole('main')).toContainText('A comprehensive textbook...');
            await expect(page.getByRole('main')).toContainText('The Law of Contract in Singapore');
            await expect(page.getByRole('main')).toContainText('A bestselling book in Singapore...');

            // Click on more details button of similar product (Textbook)
            await page.getByRole('button', { name: 'More Details' }).first().click();

            await expect(page.locator('h1')).toContainText('Product Details');
            await expect(page.getByRole('main')).toContainText('Name : Textbook');
            await expect(page.getByRole('main')).toContainText('Description : A comprehensive textbook');
            await expect(page.getByRole('main')).toContainText('Price :$79.99');
            await expect(page.getByRole('main')).toContainText('Category : Book');
            await expect(page.getByRole('main')).toMatchAriaSnapshot(`- button "ADD TO CART"`);
            await expect(page.getByRole('main')).toContainText('Similar Products ➡️');
            await expect(page.getByRole('main')).toContainText('Novel$14.99');
            await expect(page.getByRole('main')).toContainText('A bestselling novel...');
            await expect(page.getByRole('main')).toContainText('The Law of Contract in Singapore');
            await expect(page.getByRole('main')).toContainText('A bestselling book in Singapore...');

            // Go back home, ensure all products load again 
            await page.getByRole('link', { name: 'Home' }).click();

            await expect(page.getByRole('main')).toContainText('Novel');
            await expect(page.getByRole('main')).toContainText('The Law of Contract in Singapore');
            await expect(page.getByRole('main')).toContainText('NUS T-shirt');
            await expect(page.getByRole('main')).toContainText('Smartphone');
            await expect(page.getByRole('main')).toContainText('Laptop');
            await expect(page.getByRole('main')).toContainText('Textbook');

            // Click on more details button of NUS T-shirt, should not have any similar products found
            await page.locator('div:nth-child(3) > .card-body > div:nth-child(3) > button').first().click();
            
            await expect(page.locator('h1')).toContainText('Product Details');
            await expect(page.getByRole('main')).toContainText('Name : NUS T-shirt');
            await expect(page.getByRole('main')).toContainText('Description : Plain NUS T-shirt for sale');
            await expect(page.getByRole('main')).toContainText('Price :$4.99');
            await expect(page.getByRole('main')).toContainText('Category : Clothing');
            await expect(page.getByRole('main')).toMatchAriaSnapshot(`- button "ADD TO CART"`);
            await expect(page.getByRole('main')).toContainText('Similar Products ➡️');
            await expect(page.getByRole('main')).toContainText('No Similar Products found');
        })
    })

    test.describe('User not logged in', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('http://localhost:3000/');
        });

        test('new user NO login -> homepage loads with all products', async ({ page }) => {
            await expect(page.getByRole('main')).toMatchAriaSnapshot(`
                - img "Novel"
                - heading "Novel" [level=5]
                - heading /\\$\\d+\\.\\d+/ [level=5]
                - paragraph: A bestselling novel...
                - button "More Details"
                - button "ADD TO CART"
            `);
            await expect(page.getByRole('main')).toMatchAriaSnapshot(`
                - img "The Law of Contract in Singapore"
                - heading "The Law of Contract in Singapore" [level=5]
                - heading /\\$\\d+\\.\\d+/ [level=5]
                - paragraph: A bestselling book in Singapore...
                - button "More Details"
                - button "ADD TO CART"
            `);
            await expect(page.getByRole('main')).toMatchAriaSnapshot(`
                - img "NUS T-shirt"
                - heading "NUS T-shirt" [level=5]
                - heading /\\$\\d+\\.\\d+/ [level=5]
                - paragraph: Plain NUS T-shirt for sale...
                - button "More Details"
                - button "ADD TO CART"
            `);
            await expect(page.getByRole('main')).toMatchAriaSnapshot(`
                - img "Smartphone"
                - heading "Smartphone" [level=5]
                - heading /\\$\\d+\\.\\d+/ [level=5]
                - paragraph: A high-end smartphone...
                - button "More Details"
                - button "ADD TO CART"
            `);
            await expect(page.getByRole('main')).toMatchAriaSnapshot(`
                - img "Laptop"
                - heading "Laptop" [level=5]
                - heading /\\$\\d+,\\d+\\.\\d+/ [level=5]
                - paragraph: A powerful laptop...
                - button "More Details"
                - button "ADD TO CART"
            `);
            await expect(page.getByRole('main')).toMatchAriaSnapshot(`
                - heading "Textbook" [level=5]
                - heading /\\$\\d+\\.\\d+/ [level=5]
                - paragraph: A comprehensive textbook...
                - button "More Details"
                - button "ADD TO CART"
            `);
        });
    })
})
