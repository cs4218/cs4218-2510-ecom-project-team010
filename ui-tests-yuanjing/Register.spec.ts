import { test, expect } from '@playwright/test';

// The base URL of your local development server
const BASE_URL = 'http://localhost:3000';

// A unique email for each test run to avoid conflicts
// This version uses a timestamp and a random number for uniqueness.
const generateUniqueEmail = () => `testuser_${Date.now()}_${Math.floor(Math.random() * 1000)}@example.com`;

// Group all registration-related tests together
test.describe('User Registration Flow', () => {

  test('should load the register page and display the form fields', async ({ page }) => {
    // GIVEN: The user is on the homepage.
    await page.goto(BASE_URL);

    // WHEN: The user clicks the link to navigate to the register page.
    await page.getByRole('link', { name: 'Register' }).click();
    await expect(page).toHaveURL(`${BASE_URL}/register`);

    // THEN: All the main registration form fields should be visible.
    await expect(page.getByRole('heading', { name: 'Register Form' })).toBeVisible();
    await expect(page.getByPlaceholder('Enter Your Name')).toBeVisible();
    await expect(page.getByPlaceholder('Enter Your Email')).toBeVisible();
    await expect(page.getByPlaceholder('Enter Your Password')).toBeVisible();
    await expect(page.getByPlaceholder('Enter Your Phone')).toBeVisible();
    await expect(page.getByPlaceholder('Enter Your Address')).toBeVisible();
    await expect(page.getByPlaceholder('What is Your Favorite sports')).toBeVisible();
    await expect(page.getByRole('button', { name: 'REGISTER' })).toBeVisible();
  });

  test('should allow a user to register with a valid form submission', async ({ page }) => {
    // GIVEN: The user is on the registration page.
    await page.goto(`${BASE_URL}/register`);
    const uniqueEmail = generateUniqueEmail();

    // WHEN: The user fills in all required fields with valid data and submits the form.
    await page.getByPlaceholder('Enter Your Name').fill('Test User');
    await page.getByPlaceholder('Enter Your Email').fill(uniqueEmail);
    await page.getByPlaceholder('Enter Your Password').fill('password123');
    await page.getByPlaceholder('Enter Your Phone').fill('98765432');
    await page.getByPlaceholder('Enter Your Address').fill('123 Test Street');
    await page.getByPlaceholder('Enter Your DOB').fill('2000-01-01');
    await page.getByPlaceholder('What is Your Favorite sports').fill('Tennis');
    
    // Intercept the navigation to ensure the button click triggers it
    await Promise.all([
      page.waitForURL(`${BASE_URL}/login`), // Wait for the URL to change to the login page
      page.getByRole('button', { name: 'REGISTER' }).click(),
    ]);

    // THEN: The user should be redirected to the login page after successful registration.
    await expect(page).toHaveURL(`${BASE_URL}/login`);
    // Optional: You could also look for a success message if one appears on the login page.
  });

  test('should display validation errors for empty required fields', async ({ page }) => {
    // GIVEN: The user is on the registration page.
    await page.goto(`${BASE_URL}/register`);

    // WHEN: The user clicks the "REGISTER" button without filling out any fields.
    await page.getByRole('button', { name: 'REGISTER' }).click();

    // THEN: Validation messages should appear for required fields.
    const nameInput = page.getByPlaceholder('Enter Your Name');
    const emailInput = page.getByPlaceholder('Enter Your Email');
    const passwordInput = page.getByPlaceholder('Enter Your Password');

    // This checks the browser's built-in validation feedback
    expect(await nameInput.evaluate(node => (node as HTMLInputElement).checkValidity())).toBe(false);
    expect(await emailInput.evaluate(node => (node as HTMLInputElement).checkValidity())).toBe(false);
    expect(await passwordInput.evaluate(node => (node as HTMLInputElement).checkValidity())).toBe(false);
  });

  test('should display a validation error for an invalid email format', async ({ page }) => {
    // GIVEN: The user is on the registration page.
    await page.goto(`${BASE_URL}/register`);

    // WHEN: The user enters text that is not a valid email format.
    await page.getByPlaceholder('Enter Your Email').fill('not-a-valid-email');
    await page.getByRole('button', { name: 'REGISTER' }).click();

    // THEN: The browser's HTML5 validation should prevent form submission.
    const emailInput = page.getByPlaceholder('Enter Your Email');
    expect(await emailInput.evaluate(node => (node as HTMLInputElement).checkValidity())).toBe(false);
  });

  test('should display an error when registering with an existing email', async ({ page }) => {
    // GIVEN: A user with a specific email already exists in the system.
    const existingEmail = generateUniqueEmail();
    
    // First, create the user so they exist in the backend.
    await page.goto(`${BASE_URL}/register`);
    await page.getByPlaceholder('Enter Your Name').fill('Existing User');
    await page.getByPlaceholder('Enter Your Email').fill(existingEmail);
    await page.getByPlaceholder('Enter Your Password').fill('password123');
    await page.getByPlaceholder('Enter Your Phone').fill('11122233');
    await page.getByPlaceholder('Enter Your Address').fill('456 Old Street');
    await page.getByPlaceholder('What is Your Favorite sports').fill('Soccer');
    await page.getByPlaceholder('Enter Your DOB').fill('2000-01-01');
    await page.getByRole('button', { name: 'REGISTER' }).click();
    await page.waitForURL(`${BASE_URL}/login`); // Ensure the first user is created

    // WHEN: A new user tries to register using the same email address.
    await page.goto(`${BASE_URL}/register`);
    await page.getByPlaceholder('Enter Your Name').fill('New User');
    await page.getByPlaceholder('Enter Your Email').fill(existingEmail); // Use the same email
    await page.getByPlaceholder('Enter Your Password').fill('anotherpassword');
    await page.getByPlaceholder('Enter Your Phone').fill('44455566');
    await page.getByPlaceholder('Enter Your Address').fill('789 New Avenue');
    await page.getByPlaceholder('What is Your Favorite sports').fill('Basketball');
    await page.getByPlaceholder('Enter Your DOB').fill('2000-01-01');
    await page.getByRole('button', { name: 'REGISTER' }).click();

    const toast = page.getByText('User with that email already exists, please login');
    await expect(toast).toBeVisible();
    
    // And ensure the user remains on the register page.
    await expect(page).toHaveURL(`${BASE_URL}/register`);
  });
});

