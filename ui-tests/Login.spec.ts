import { test, expect } from '@playwright/test';

// The base URL of your local development server
const BASE_URL = 'http://localhost:3000';

// Helper function to generate a unique email for each test run
const generateUniqueEmail = () => `testuser_${Date.now()}_${Math.floor(Math.random() * 1000)}@example.com`;

// A user object to be created before tests that need an existing user
const testUser = {
  name: 'Login Test User',
  email: generateUniqueEmail(),
  password: 'password123',
  phone: '12345678',
  address: '123 Login Lane',
  dob: '1995-05-15',
  answer: 'Testing',
};

// Group all login-related tests together
test.describe('User Login Flow', () => {

  // Before running the tests in this suite, create a user to test against.
  // This ensures the tests are self-contained and don't rely on an existing DB state.
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await page.goto(`${BASE_URL}/register`);
    await page.getByPlaceholder('Enter Your Name').fill(testUser.name);
    await page.getByPlaceholder('Enter Your Email ').fill(testUser.email);
    await page.getByPlaceholder('Enter Your Password').fill(testUser.password);
    await page.getByPlaceholder('Enter Your Phone').fill(testUser.phone);
    await page.getByPlaceholder('Enter Your Address').fill(testUser.address);
    await page.getByPlaceholder('Enter Your DOB').fill(testUser.dob);
    await page.getByPlaceholder('What is Your Favorite sports').fill(testUser.answer);
    await page.getByRole('button', { name: 'REGISTER' }).click();
    await page.waitForURL(`${BASE_URL}/login`);
    await page.close();
  });

  test('should load the login page and display the form fields', async ({ page }) => {
    // GIVEN: The user is on the homepage.
    await page.goto(BASE_URL);

    // WHEN: The user clicks the link to navigate to the login page.
    await page.getByRole('link', { name: 'Login' }).click();
    await expect(page).toHaveURL(`${BASE_URL}/login`);

    // THEN: All the main login form fields should be visible.
    await expect(page.getByRole('heading', { name: 'LOGIN FORM' })).toBeVisible();
    await expect(page.getByPlaceholder('Enter Your Email')).toBeVisible();
    await expect(page.getByPlaceholder('Enter Your Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'LOGIN' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Forgot Password' })).toBeVisible();
  });

  test('should allow a registered user to log in successfully', async ({ page }) => {
    // GIVEN: A user has been registered and is on the login page.
    await page.goto(`${BASE_URL}/login`);

    // WHEN: The user enters their correct credentials and clicks the LOGIN button.
    await page.getByPlaceholder('Enter Your Email').fill(testUser.email);
    await page.getByPlaceholder('Enter Your Password').fill(testUser.password);
    
    await Promise.all([
      page.waitForURL(BASE_URL + '/'), // Wait for redirection to the homepage
      page.getByRole('button', { name: 'LOGIN' }).click(),
    ]);

    // THEN: The user should be redirected to the homepage.
    await expect(page).toHaveURL(BASE_URL + '/');
    // AND a success toast should be visible.
    const successToast = page.getByText(/Login successful/i);
    await expect(successToast).toBeVisible();
  });

  test('should display an error for an incorrect password', async ({ page }) => {
    // GIVEN: A registered user is on the login page.
    await page.goto(`${BASE_URL}/login`);

    // WHEN: The user enters the correct email but an incorrect password.
    await page.getByPlaceholder('Enter Your Email').fill(testUser.email);
    await page.getByPlaceholder('Enter Your Password').fill('wrong-password');
    await page.getByRole('button', { name: 'LOGIN' }).click();

    // THEN: An error toast should appear with a relevant message.
    const errorToast = page.getByText(/Invalid Password/i);
    await expect(errorToast).toBeVisible();

    // AND the user should remain on the login page.
    await expect(page).toHaveURL(`${BASE_URL}/login`);
  });

  test('should display an error for a non-existent email', async ({ page }) => {
    // GIVEN: The user is on the login page.
    await page.goto(`${BASE_URL}/login`);

    // WHEN: The user enters an email that is not registered.
    await page.getByPlaceholder('Enter Your Email').fill('nonexistent@example.com');
    await page.getByPlaceholder('Enter Your Password').fill('any-password');
    await page.getByRole('button', { name: 'LOGIN' }).click();

    // THEN: An error toast should appear with a relevant message.
    const errorToast = page.getByText("Something went wrong");
    await expect(errorToast).toBeVisible();

    // AND the user should remain on the login page.
    await expect(page).toHaveURL(`${BASE_URL}/login`);
  });

  test('should navigate to the forgot password page when the link is clicked', async ({ page }) => {
    // GIVEN: The user is on the login page.
    await page.goto(`${BASE_URL}/login`);

    // WHEN: The user clicks the "Forgot Password" button.
    await page.getByRole('button', { name: 'Forgot Password' }).click();

    // THEN: The user should be redirected to the forgot password page.
    await expect(page).toHaveURL(`${BASE_URL}/forgot-password`);
  });
});
