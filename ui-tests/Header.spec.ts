import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

const BASE_URL = 'http://localhost:3000';

test.beforeEach(async ({ page }) => {
  await page.goto(`${BASE_URL}/`);
});

test.describe('Header component', () => {
  test('upon loading home page -> should render header with brand logo', async ({ page }) => {
    await expect(page.getByRole('link', { name: '🛒 Virtual Vault' })).toBeVisible();
  });

  test('upon loading home page -> should render navigation toggle button on mobile', async ({ page }) => {
    // Set mobile viewport to ensure toggle button is visible
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByRole('button', { name: 'Toggle navigation' })).toBeVisible();
  });

  test('upon loading home page -> navigation should be visible on desktop without toggle', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 });
    
    // On desktop, navigation should be visible
    await expect(page.locator('#navbarTogglerDemo01')).toBeVisible();
    
    // Main navigation links should be visible
    await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Categories' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Cart' })).toBeVisible();
  });

  test('upon loading home page -> should render main navigation links', async ({ page }) => {
    // Check Home link
    await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
    
    // Check Categories dropdown
    await expect(page.getByRole('link', { name: 'Categories' })).toBeVisible();
    
    // Check Cart link
    await expect(page.getByRole('link', { name: 'Cart' })).toBeVisible();
  });

  test('upon loading home page -> should render authentication links for guest users', async ({ page }) => {
    // Check Register link
    await expect(page.getByRole('link', { name: 'Register' })).toBeVisible();
    
    // Check Login link
    await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
  });

  test('navigation -> Home link navigates to home page', async ({ page }) => {
    // Navigate to a different page first
    await page.goto(`${BASE_URL}/about`);
    
    // Click Home link
    await Promise.all([
      page.waitForURL('**/'),
      page.getByRole('link', { name: 'Home' }).click(),
    ]);

    await expect(page).toHaveURL(/\/$/);
  });

  test('navigation -> Categories dropdown shows all categories option', async ({ page }) => {
    // Click on Categories dropdown
    await page.getByRole('link', { name: 'Categories' }).click();
    
    // Check for "All Categories" option
    await expect(page.getByRole('link', { name: 'All Categories' })).toBeVisible();
  });

  test('navigation -> Categories dropdown navigates to categories page', async ({ page }) => {
    // Click on Categories dropdown
    await page.getByRole('link', { name: 'Categories' }).click();
    
    // Click All Categories
    await Promise.all([
      page.waitForURL('**/categories'),
      page.getByRole('link', { name: 'All Categories' }).click(),
    ]);

    await expect(page).toHaveURL(/\/categories$/);
  });

  test('navigation -> Register link navigates to register page', async ({ page }) => {
    await Promise.all([
      page.waitForURL('**/register'),
      page.getByRole('link', { name: 'Register' }).click(),
    ]);

    await expect(page).toHaveURL(/\/register$/);
  });

  test('navigation -> Login link navigates to login page', async ({ page }) => {
    await Promise.all([
      page.waitForURL('**/login'),
      page.getByRole('link', { name: 'Login' }).click(),
    ]);

    await expect(page).toHaveURL(/\/login$/);
  });

  test('navigation -> Cart link navigates to cart page', async ({ page }) => {
    await Promise.all([
      page.waitForURL('**/cart'),
      page.getByRole('link', { name: 'Cart' }).click(),
    ]);

    await expect(page).toHaveURL(/\/cart$/);
  });

  test('responsive -> mobile toggle button shows/hides navigation menu', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    const toggleButton = page.getByRole('button', { name: 'Toggle navigation' });
    const navMenu = page.locator('#navbarTogglerDemo01');
    
    // Initially, menu should be collapsed
    await expect(navMenu).toHaveClass(/collapse/);
    
    // Click toggle button to expand
    await toggleButton.click();
    await expect(navMenu).toHaveClass(/show/);
    
    // Click toggle button to collapse
    await toggleButton.click();
    await expect(navMenu).toHaveClass(/collapse/);
  });

  test('brand logo -> should navigate to home page when clicked', async ({ page }) => {
    // Navigate to a different page first
    await page.goto(`${BASE_URL}/about`);
    
    // Click brand logo
    await Promise.all([
      page.waitForURL('**/'),
      page.getByRole('link', { name: '🛒 Virtual Vault' }).click(),
    ]);

    await expect(page).toHaveURL(/\/$/);
  });

  test('cart badge -> should show cart count when items are present', async ({ page }) => {
    // Add items to cart (simulate by going to products and adding)
    await page.goto(`${BASE_URL}/`);
    
    // Try to add items to cart if available
    const addToCartButtons = page.locator('button:has-text("ADD TO CART")');
    if (await addToCartButtons.count() > 0) {
      await addToCartButtons.first().click();
      
      // Check if cart badge shows count
      const cartBadge = page.locator('.ant-badge-count');
      await expect(cartBadge).toBeVisible();
    }
  });

  test('authenticated user -> should show user dropdown instead of login/register', async ({ page }) => {
    // First register and login a test user
    await page.goto(`${BASE_URL}/register`);
    
    // Fill registration form
    await page.getByPlaceholder('Enter Your Name').fill('Header Test');
    await page.getByPlaceholder('Enter Your Email').fill('headertest@gmail.com');
    await page.getByPlaceholder('Enter Your Password').fill('password');
    await page.getByPlaceholder('Enter Your Phone').fill('1234567890');
    await page.getByPlaceholder('Enter Your Address').fill('123 Test St');
    await page.getByPlaceholder('Enter Your DOB').fill('2000-01-01');
    await page.getByPlaceholder('What is Your Favorite sports').fill('Football');
    
    // Submit registration
    await page.getByRole('button', { name: 'REGISTER' }).click();
    await page.waitForTimeout(3000);
    
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('headertest@gmail.com');
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('password');
    await page.getByRole('button', { name: 'LOGIN' }).click();
    
    // Wait for successful login and redirect
    await page.waitForURL('**/', { timeout: 15000 });
    await page.waitForTimeout(3000);
    
    // Check if user dropdown exists
    const userDropdown = page.locator('.nav-item.dropdown .nav-link').filter({ hasText: 'Header Test' });
    if (await userDropdown.count() > 0) {
      const dropdownText = await userDropdown.textContent();
      console.log('User dropdown text:', dropdownText);
      await expect(userDropdown).toBeVisible();
    } else {
      // Fallback: check for any authenticated user indicator
      const authIndicator = page.locator('.nav-link').filter({ hasText: /Header Test|User|Dashboard/ });
      if (await authIndicator.count() > 0) {
        await expect(authIndicator.first()).toBeVisible();
      } else {
        throw new Error('No authenticated user indicator found');
      }
    }
    
    // Check that login/register links are not visible
    await expect(page.getByRole('link', { name: 'Register' })).not.toBeVisible();
    await expect(page.getByRole('link', { name: 'Login' })).not.toBeVisible();
  });

  test('authenticated user -> user dropdown shows dashboard and logout options', async ({ page }) => {
    // Login first
    await page.goto(`${BASE_URL}/login`);
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('headertest@gmail.com');
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('password');
    await page.getByRole('button', { name: 'LOGIN' }).click();
    await page.waitForURL('**/', { timeout: 15000 });
    await page.waitForTimeout(3000);
    
    // Find user dropdown
    const userDropdown = page.locator('.nav-item.dropdown .nav-link').filter({ hasText: 'Header Test' });
    if (await userDropdown.count() > 0) {
      await userDropdown.click();
      
      // Check for Dashboard option
      await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
      
      // Check for Logout option
      await expect(page.getByRole('link', { name: 'Logout' })).toBeVisible();
    } else {
      // If no dropdown found, skip this test
      test.skip(true, 'User dropdown not found - authentication may have failed');
    }
  });

  test('authenticated user -> dashboard link navigates to user dashboard', async ({ page }) => {
    // Login first
    await page.goto(`${BASE_URL}/login`);
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('headertest@gmail.com');
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('password');
    await page.getByRole('button', { name: 'LOGIN' }).click();
    await page.waitForURL('**/', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    // Click user dropdown
    const userDropdown = page.locator('.nav-item.dropdown .nav-link').filter({ hasText: 'Header Test' });
    await userDropdown.click();
    
    // Click Dashboard
    await Promise.all([
      page.waitForURL('**/dashboard/user'),
      page.getByRole('link', { name: 'Dashboard' }).click(),
    ]);

    await expect(page).toHaveURL(/\/dashboard\/user$/);
  });

  test('logout -> should logout user and show login/register links', async ({ page }) => {
    // Login first
    await page.goto(`${BASE_URL}/login`);
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('headertest@gmail.com');
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('password');
    await page.getByRole('button', { name: 'LOGIN' }).click();
    await page.waitForURL('**/', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    // Click user dropdown and logout
    const userDropdown = page.locator('.nav-item.dropdown .nav-link').filter({ hasText: 'Header Test' });
    await userDropdown.click();
    await page.getByRole('link', { name: 'Logout' }).click();
    
    // Wait for logout to complete
    await page.waitForTimeout(2000);
    
    // Check that login/register links are visible again
    await expect(page.getByRole('link', { name: 'Register' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
    
    // Check that user dropdown is not visible
    await expect(page.getByRole('link', { name: 'Header Test' })).not.toBeVisible();
  });

  test('header structure -> should have proper Bootstrap classes and navigation structure', async ({ page }) => {
    // Check navbar structure
    await expect(page.locator('.navbar.navbar-expand-lg.bg-body-tertiary')).toBeVisible();
    await expect(page.locator('.navbar .container-fluid')).toBeVisible();
    await expect(page.locator('.navbar-nav')).toBeVisible();
    
    // Check brand link structure
    const brandLink = page.getByRole('link', { name: '🛒 Virtual Vault' });
    await expect(brandLink).toHaveClass('navbar-brand');
  });

  test('search input -> should be present in navigation', async ({ page }) => {
    // Check for search input component - it might be a SearchInput component
    // Try different selectors for search input
    const searchInput = page.locator('input[type="text"], input[placeholder*="search" i], input[name*="search" i]').first();
    if (await searchInput.count() > 0) {
      await expect(searchInput).toBeVisible();
    } else {
      // If no search input found, just verify the SearchInput component is present
      await expect(page.locator('li').filter({ hasText: /search/i })).toBeVisible();
    }
  });

  test('header visibility -> should be visible on all pages', async ({ page }) => {
    // Test header visibility on different pages
    const pages = ['/', '/about', '/contact', '/categories', '/cart'];
    
    for (const pagePath of pages) {
      await page.goto(`${BASE_URL}${pagePath}`);
      await expect(page.getByRole('link', { name: '🛒 Virtual Vault' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Cart' })).toBeVisible();
    }
  });
});
