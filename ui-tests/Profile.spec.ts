import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

const BASE_URL = 'http://localhost:3000';
const PROFILE_URL = `${BASE_URL}/dashboard/user/profile`;

// Helper function to authenticate test user
async function authenticateUser(page) {
  await page.goto(`${BASE_URL}/register`);
  
  // Fill registration form
  await page.getByPlaceholder('Enter Your Name').fill('test');
  await page.getByPlaceholder('Enter Your Email').fill('test@gmail.com');
  await page.getByPlaceholder('Enter Your Password').fill('password');
  await page.getByPlaceholder('Enter Your Phone').fill('1234');
  await page.getByPlaceholder('Enter Your Address').fill('123 Test St');
  await page.getByPlaceholder('What is Your Favorite sports').fill('test');
  
  // Submit registration
  await page.getByRole('button', { name: 'REGISTER' }).click();
  
  // Wait for registration to complete
  await page.waitForTimeout(2000);
  
  // Now login with the test user
  await page.goto(`${BASE_URL}/login`);
  
  // Fill login form with test credentials
  await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('test@gmail.com');
  await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('password');
  
  // Submit login form
  await page.getByRole('button', { name: 'LOGIN' }).click();
  
  // Wait for successful login and redirect to home page
  await page.waitForURL('**/', { timeout: 10000 });
  
  // Wait a bit for authentication to complete
  await page.waitForTimeout(2000);
  
  // Now navigate to the profile page
  await page.goto(PROFILE_URL);
  
  // Wait for profile page to fully load
  await page.waitForLoadState('networkidle');
}

test.beforeEach(async ({ page }) => {
  await authenticateUser(page);
});

test.describe('Profile page', () => {
  test('upon loading profile page -> should render page title', async ({ page }) => {
    // Wait for the profile page to load and title to update
    await page.waitForFunction(() => document.title.includes('Your Profile'), { timeout: 10000 });
    await expect(page).toHaveTitle(/Your Profile/);
  });

  test('upon loading profile page -> should render USER PROFILE heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'USER PROFILE' })).toBeVisible();
  });

  test('upon loading profile page -> should render UserMenu component', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Profile' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Orders' })).toBeVisible();
  });

  test('upon loading profile page -> should render all form input fields', async ({ page }) => {
    // Name input
    await expect(page.getByPlaceholder('Enter Your Name')).toBeVisible();
    
    // Email input
    await expect(page.getByPlaceholder('Enter Your Email ')).toBeVisible();
    
    // Password input
    await expect(page.getByPlaceholder('Enter Your Password')).toBeVisible();
    
    // Phone input
    await expect(page.getByPlaceholder('Enter Your Phone')).toBeVisible();
    
    // Address input
    await expect(page.getByPlaceholder('Enter Your Address')).toBeVisible();
  });

  test('upon loading profile page -> should render UPDATE button', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'UPDATE' })).toBeVisible();
  });

  test('upon loading profile page -> should populate form fields with user data', async ({ page }) => {
    // Wait for the component to load user data
    await page.waitForTimeout(1000);
    
    // Check that form fields are populated with test user data
    await expect(page.getByPlaceholder('Enter Your Name')).toHaveValue('test');
    await expect(page.getByPlaceholder('Enter Your Email ')).toHaveValue('test@gmail.com');
    await expect(page.getByPlaceholder('Enter Your Phone')).toHaveValue('1234');
    await expect(page.getByPlaceholder('Enter Your Address')).toHaveValue('123');
    
    // Password field should be empty
    await expect(page.getByPlaceholder('Enter Your Password')).toHaveValue('');
  });

  test('form input changes -> should update field values', async ({ page }) => {
    const nameInput = page.getByPlaceholder('Enter Your Name');
    const emailInput = page.getByPlaceholder('Enter Your Email ');
    const phoneInput = page.getByPlaceholder('Enter Your Phone');
    const addressInput = page.getByPlaceholder('Enter Your Address');
    const passwordInput = page.getByPlaceholder('Enter Your Password');

    // Update name
    await nameInput.fill('Jane Doe');
    await expect(nameInput).toHaveValue('Jane Doe');

    // Update email
    await emailInput.fill('jane@example.com');
    await expect(emailInput).toHaveValue('jane@example.com');

    // Update phone
    await phoneInput.fill('9876543210');
    await expect(phoneInput).toHaveValue('9876543210');

    // Update address
    await addressInput.fill('456 Oak Ave');
    await expect(addressInput).toHaveValue('456 Oak Ave');

    // Update password
    await passwordInput.fill('newpassword123');
    await expect(passwordInput).toHaveValue('newpassword123');
  });

  test('form submission -> should submit form with updated data', async ({ page }) => {
    // Mock the API response - Profile.js uses PUT request to /api/v1/auth/profile
    await page.route('**/api/v1/auth/profile', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          updatedUser: {
            _id: 'test-user-id',
            name: 'Jane Doe',
            email: 'jane@example.com',
            phone: '9876543210',
            address: '456 Oak Ave'
          }
        })
      });
    });

    // Update form fields using exact placeholder text from Profile.js
    await page.getByPlaceholder('Enter Your Name').fill('Jane Doe');
    await page.getByPlaceholder('Enter Your Email ').fill('jane@example.com');
    await page.getByPlaceholder('Enter Your Phone').fill('9876543210');
    await page.getByPlaceholder('Enter Your Address').fill('456 Oak Ave');

    // Submit form
    await page.getByRole('button', { name: 'UPDATE' }).click();

    // Check for success toast - Profile.js shows "Profile Updated Successfully"
    await expect(page.getByText('Profile Updated Successfully')).toBeVisible();
  });

  test('form submission with error -> should show error message', async ({ page }) => {
    // Mock the API response with error - Profile.js checks for data?.error
    await page.route('**/api/v1/auth/profile', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Invalid data provided'
        })
      });
    });

    // Submit form
    await page.getByRole('button', { name: 'UPDATE' }).click();

    // Check for error toast - Profile.js shows the error message from API response
    await expect(page.getByText('Invalid data provided')).toBeVisible();
  });

  test('form submission with network error -> should show generic error message', async ({ page }) => {
    // Mock network error
    await page.route('**/api/v1/auth/profile', async route => {
      await route.abort('failed');
    });

    // Submit form
    await page.getByRole('button', { name: 'UPDATE' }).click();

    // Check for generic error toast - Profile.js catch block shows "Something went wrong"
    await expect(page.getByText('Something went wrong')).toBeVisible();
  });

  // Testing UserMenu navigation
  test('testing UserMenu component: Profile link navigates to Profile page', async ({ page }) => {
    const profileLink = page.getByRole('link', { name: 'Profile' });
    
    await Promise.all([
      page.waitForURL('**/dashboard/user/profile'),
      profileLink.click(),
    ]);

    await expect(page).toHaveURL(/\/dashboard\/user\/profile$/);
    await expect(page.getByRole('heading', { name: 'USER PROFILE' })).toBeVisible();
  });

  test('testing UserMenu component: Orders link navigates to Orders page', async ({ page }) => {
    const ordersLink = page.getByRole('link', { name: 'Orders' });
    
    await Promise.all([
      page.waitForURL('**/dashboard/user/orders'),
      ordersLink.click(),
    ]);

    await expect(page).toHaveURL(/\/dashboard\/user\/orders$/);
  });

  // Testing header navigation (similar to About page tests)
  test('testing header component: Home link navigates to Home page', async ({ page }) => {
    const toggler = page.getByRole('button', { name: /toggle navigation/i });
    const homeLink = page.getByRole('link', { name: /^home$/i });

    if (!(await homeLink.isVisible())) {
      await toggler.click();
      await expect(homeLink).toBeVisible();
    }

    await Promise.all([
      page.waitForURL((url) => url.pathname === '/' || url.pathname === '/index.html'),
      homeLink.click(),
    ]);

    await expect(page).toHaveURL(/\/$/);
    // quick sanity check that correct home page header rendered:
    // brand text "Virtual Vault" is a stable anchor
    await expect(page.getByRole('link', { name: /virtual vault/i })).toBeVisible();
  });

  // Testing footer navigation (similar to About page tests)
  test('testing footer component: Contact link navigates to Contact page', async ({ page }) => {
    const footer = page.locator('.footer');
    await expect(footer).toBeVisible();

    await Promise.all([
      page.waitForURL('**/contact'),
      footer.getByRole('link', { name: /^contact$/i }).click(),
    ]);

    await expect(page).toHaveURL(/\/contact$/);
  });

  test('form validation -> should handle empty password field', async ({ page }) => {
    // Mock successful API response
    await page.route('**/api/v1/auth/profile', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          updatedUser: {
            _id: 'test-user-id',
            name: 'test Updated',
            email: 'test@gmail.com',
            phone: '1234567890',
            address: '123 Test St'
          }
        })
      });
    });

    // Update only name field, leave password empty
    await page.getByPlaceholder('Enter Your Name').fill('test Updated');
    
    // Submit form
    await page.getByRole('button', { name: 'UPDATE' }).click();

    // Should still work with empty password
    await expect(page.getByText('Profile Updated Successfully')).toBeVisible();
  });

  test('form structure -> should have proper Bootstrap layout', async ({ page }) => {
    await expect(page.locator('.container-fluid.m-3.p-3')).toBeVisible();
    await expect(page.locator('.row')).toBeVisible();
    await expect(page.locator('.col-md-3')).toBeVisible();
    await expect(page.locator('.col-md-9')).toBeVisible();
    
    // Check for form structure
    const form = page.locator('.form-container form');
    await expect(form).toBeVisible();
    
    // Check that UPDATE button is inside the form
    const updateButton = page.getByRole('button', { name: 'UPDATE' });
    await expect(updateButton).toBeVisible();
    await expect(form.locator('button')).toContainText('UPDATE');
  });

  test('authentication -> should redirect to home page if not authenticated', async ({ page }) => {
    // Clear authentication
    await page.evaluate(() => {
      localStorage.removeItem('auth');
    });
    
    // Navigate to profile page
    await page.goto(PROFILE_URL);
    
    // Should redirect to home page
    await expect(page).toHaveURL(/\/$/);
  });

  test('page accessibility -> should have proper form labels and structure', async ({ page }) => {
    // Check that form inputs have proper attributes
    const nameInput = page.getByPlaceholder('Enter Your Name');
    const emailInput = page.getByPlaceholder('Enter Your Email');
    const passwordInput = page.getByPlaceholder('Enter Your Password');
    
    await expect(nameInput).toHaveAttribute('type', 'text');
    await expect(emailInput).toHaveAttribute('type', 'email');
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Check that form has proper heading structure
    await expect(page.getByRole('heading', { name: 'USER PROFILE' })).toBeVisible();
    
    // Check that buttons have proper roles
    await expect(page.getByRole('button', { name: 'UPDATE' })).toBeVisible();
  });
});
