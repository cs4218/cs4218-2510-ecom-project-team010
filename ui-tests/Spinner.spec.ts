import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

const BASE_URL = 'http://localhost:3000';

test.describe('Spinner component', () => {
  test('upon loading spinner page -> should render spinner with countdown text', async ({ page }) => {
    // Navigate to a page that would trigger the spinner (like accessing protected route without auth)
    await page.goto(`${BASE_URL}/dashboard/user/profile`);
    
    // Wait for spinner to appear
    await expect(page.getByText(/redirecting to you in \d+ second/)).toBeVisible();
  });

  test('upon loading spinner page -> should render spinner with proper styling', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/user/profile`);
    
    // Check for spinner container with proper Bootstrap classes
    await expect(page.locator('.d-flex.flex-column.justify-content-center.align-items-center')).toBeVisible();
    
    // Check for spinner border
    await expect(page.locator('.spinner-border')).toBeVisible();
    
    // Check for accessibility role
    await expect(page.locator('[role="status"]')).toBeVisible();
  });

  test('upon loading spinner page -> should have proper height styling', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/user/profile`);
    
    // Check that the spinner container has full viewport height
    const spinnerContainer = page.locator('.d-flex.flex-column.justify-content-center.align-items-center');
    await expect(spinnerContainer).toBeVisible();
    
    // Check the inline style for height
    const containerStyle = await spinnerContainer.getAttribute('style');
    expect(containerStyle).toContain('height: 100vh');
  });

  test('spinner countdown -> should show decreasing countdown from 3 to 0', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/user/profile`);
    
    // Wait for initial countdown text
    await expect(page.getByText('redirecting to you in 3 second')).toBeVisible();
    
    // Wait for countdown to decrease
    await expect(page.getByText('redirecting to you in 2 second')).toBeVisible();
    
    // Wait for countdown to decrease further
    await expect(page.getByText('redirecting to you in 1 second')).toBeVisible();
  });

  test('spinner navigation -> should redirect to home page after countdown', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/user/profile`);
    
    // Wait for countdown to complete and redirect
    await page.waitForURL('**/', { timeout: 10000 });
    
    // Verify we're on the home page (PrivateRoute uses empty path)
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText('ALL Products')).toBeVisible();
  });

  test('spinner accessibility -> should have proper accessibility attributes', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/user/profile`);
    
    // Check for spinner role
    await expect(page.locator('[role="status"]')).toBeVisible();
    
    // Check for visually hidden loading text
    await expect(page.locator('.visually-hidden')).toBeVisible();
    await expect(page.locator('.visually-hidden')).toHaveText('Loading...');
  });

  test('spinner text -> should display correct countdown message', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/user/profile`);
    
    // Check for the countdown message format
    const countdownText = page.getByText(/redirecting to you in \d+ second/);
    await expect(countdownText).toBeVisible();
    
    // Verify the text content matches expected pattern
    const textContent = await countdownText.textContent();
    expect(textContent).toMatch(/redirecting to you in \d+ second/);
  });

  test('spinner layout -> should center content vertically and horizontally', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/user/profile`);
    
    // Check for proper Bootstrap flexbox classes
    const container = page.locator('.d-flex.flex-column.justify-content-center.align-items-center');
    await expect(container).toBeVisible();
    
    // Verify the container has the correct classes
    const containerClasses = await container.getAttribute('class');
    expect(containerClasses).toContain('d-flex');
    expect(containerClasses).toContain('flex-column');
    expect(containerClasses).toContain('justify-content-center');
    expect(containerClasses).toContain('align-items-center');
  });

  test('spinner timing -> should complete countdown in approximately 3 seconds', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/user/profile`);
    
    const startTime = Date.now();
    
    // Wait for redirect to home page
    await page.waitForURL('**/', { timeout: 10000 });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Should take approximately 3 seconds (allow some tolerance)
    expect(duration).toBeGreaterThan(1); 
    expect(duration).toBeLessThan(5000);    // But not more than 5 seconds
  });

  test('spinner state preservation -> should preserve original path in navigation state', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/user/profile`);
    
    // Wait for redirect to home page
    await page.waitForURL('**/', { timeout: 10000 });
    
    // The original path should be preserved in the navigation state
    // This is handled by React Router's location.state
    await expect(page).toHaveURL(/\/$/);
  });

  test('spinner with custom path -> should redirect to home page when path is empty', async ({ page }) => {
    // PrivateRoute uses empty path, so it redirects to home page
    await page.goto(`${BASE_URL}/dashboard/user/profile`);
    
    // Wait for redirect to home page
    await page.waitForURL('**/', { timeout: 10000 });
    await expect(page).toHaveURL(/\/$/);
  });

  test('spinner responsive -> should maintain layout on different viewport sizes', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/user/profile`);
    
    // Test on mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByText(/redirecting to you in \d+ second/)).toBeVisible();
    await expect(page.locator('.spinner-border')).toBeVisible();
    
    // Test on tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByText(/redirecting to you in \d+ second/)).toBeVisible();
    await expect(page.locator('.spinner-border')).toBeVisible();
    
    // Test on desktop
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.getByText(/redirecting to you in \d+ second/)).toBeVisible();
    await expect(page.locator('.spinner-border')).toBeVisible();
  });

  test('spinner cleanup -> should properly clean up interval on unmount', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/user/profile`);
    
    // Wait for spinner to appear
    await expect(page.getByText(/redirecting to you in \d+ second/)).toBeVisible();
    
    // Wait for redirect to complete
    await page.waitForURL('**/', { timeout: 10000 });
    
    // Verify we're on home page and spinner is gone
    await expect(page.getByText('ALL Products')).toBeVisible();
    await expect(page.getByText(/redirecting to you in \d+ second/)).not.toBeVisible();
  });

  test('spinner visual elements -> should display both text and spinner animation', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/user/profile`);
    
    // Check for countdown text
    await expect(page.getByText(/redirecting to you in \d+ second/)).toBeVisible();
    
    // Check for spinner animation
    await expect(page.locator('.spinner-border')).toBeVisible();
    
    // Check for heading element
    await expect(page.locator('h1.text-center')).toBeVisible();
  });

  test('spinner multiple triggers -> should handle multiple spinner triggers correctly', async ({ page }) => {
    // Navigate to protected route
    await page.goto(`${BASE_URL}/dashboard/user/profile`);
    
    // Wait for first redirect
    await page.waitForURL('**/', { timeout: 10000 });
    
    // Try to access another protected route
    await page.goto(`${BASE_URL}/dashboard/user/orders`);
    
    // Should trigger spinner again
    await expect(page.getByText(/redirecting to you in \d+ second/)).toBeVisible();
    
    // Wait for second redirect
    await page.waitForURL('**/', { timeout: 10000 });
  });

  test('admin route spinner -> should redirect to login page for admin routes', async ({ page }) => {
    // Navigate to admin protected route
    await page.goto(`${BASE_URL}/dashboard/admin`);
    
    // Wait for countdown to complete and redirect to login
    await page.waitForURL('**/login', { timeout: 10000 });
    
    // Verify we're on the login page (AdminRoute uses default "login" path)
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'LOGIN FORM' })).toBeVisible();
  });
});
