import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

const BASE_URL = 'http://localhost:3000';

test.describe('Pagenotfound component', () => {
  test('upon loading 404 page -> should render 404 error message', async ({ page }) => {
    await page.goto(`${BASE_URL}/nonexistent-page`);
    
    // Wait for 404 page to load
    await expect(page.getByText('404')).toBeVisible();
    await expect(page.getByText('Oops ! Page Not Found')).toBeVisible();
  });

  test('upon loading 404 page -> should have proper page title', async ({ page }) => {
    await page.goto(`${BASE_URL}/nonexistent-page`);
    
    // Check for proper page title
    await expect(page).toHaveTitle(/go back- page not found/);
  });

  test('upon loading 404 page -> should render go back button', async ({ page }) => {
    await page.goto(`${BASE_URL}/nonexistent-page`);
    
    // Check for go back button
    await expect(page.getByRole('link', { name: 'Go Back' })).toBeVisible();
  });

  test('404 page navigation -> go back button should navigate to home page', async ({ page }) => {
    await page.goto(`${BASE_URL}/nonexistent-page`);
    
    // Click go back button
    await Promise.all([
      page.waitForURL('**/'),
      page.getByRole('link', { name: 'Go Back' }).click(),
    ]);
    
    // Verify we're on home page
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText('ALL Products')).toBeVisible();
  });

  test('404 page structure -> should have proper CSS classes', async ({ page }) => {
    await page.goto(`${BASE_URL}/nonexistent-page`);
    
    // Check for proper container classes
    await expect(page.locator('.pnf')).toBeVisible();
    await expect(page.locator('.pnf-title')).toBeVisible();
    await expect(page.locator('.pnf-heading')).toBeVisible();
    await expect(page.locator('.pnf-btn')).toBeVisible();
  });

  test('404 page content -> should display correct error content', async ({ page }) => {
    await page.goto(`${BASE_URL}/nonexistent-page`);
    
    // Check for 404 title
    const title404 = page.locator('.pnf-title');
    await expect(title404).toBeVisible();
    await expect(title404).toHaveText('404');
    
    // Check for error heading
    const errorHeading = page.locator('.pnf-heading');
    await expect(errorHeading).toBeVisible();
    await expect(errorHeading).toHaveText('Oops ! Page Not Found');
    
    // Check for go back button text
    const goBackBtn = page.locator('.pnf-btn');
    await expect(goBackBtn).toBeVisible();
    await expect(goBackBtn).toHaveText('Go Back');
  });

  test('404 page accessibility -> should have proper heading hierarchy', async ({ page }) => {
    await page.goto(`${BASE_URL}/nonexistent-page`);
    
    // Check for proper heading structure
    await expect(page.getByRole('heading', { name: '404', level: 1 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Oops ! Page Not Found', level: 2 })).toBeVisible();
  });

  test('404 page accessibility -> should have proper link attributes', async ({ page }) => {
    await page.goto(`${BASE_URL}/nonexistent-page`);
    
    // Check for go back link
    const goBackLink = page.getByRole('link', { name: 'Go Back' });
    await expect(goBackLink).toBeVisible();
    
    // Verify link href points to home page
    const href = await goBackLink.getAttribute('href');
    expect(href).toBe('/');
  });

  test('404 page layout -> should be wrapped in Layout component', async ({ page }) => {
    await page.goto(`${BASE_URL}/nonexistent-page`);
    
    // Check for Layout component elements (Header and Footer)
    await expect(page.getByRole('link', { name: '🛒 Virtual Vault' })).toBeVisible();
    await expect(page.getByText('All Rights Reserved © TestingComp')).toBeVisible();
  });

  test('404 page responsive -> should maintain layout on different viewport sizes', async ({ page }) => {
    await page.goto(`${BASE_URL}/nonexistent-page`);
    
    // Test on mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    await expect(page.getByText('404')).toBeVisible();
    await expect(page.getByText('Oops ! Page Not Found')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Go Back' })).toBeVisible();
    
    // Test on tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    await expect(page.getByText('404')).toBeVisible();
    await expect(page.getByText('Oops ! Page Not Found')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Go Back' })).toBeVisible();
    
    // Test on desktop
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(1000);
    await expect(page.getByText('404')).toBeVisible();
    await expect(page.getByText('Oops ! Page Not Found')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Go Back' })).toBeVisible();
  });

  test('404 page multiple routes -> should show 404 for various non-existent routes', async ({ page }) => {
    const nonExistentRoutes = [
      '/random-page',
      '/admin/nonexistent',
      '/user/invalid',
      '/products/fake-product',
      '/categories/invalid-category'
    ];
    
    for (const route of nonExistentRoutes) {
      await page.goto(`${BASE_URL}${route}`);
      
      // Should show 404 page
      await expect(page.getByText('404')).toBeVisible();
      await expect(page.getByText('Oops ! Page Not Found')).toBeVisible();
      await expect(page.getByRole('link', { name: 'Go Back' })).toBeVisible();
    }
  });

  test('404 page navigation state -> should preserve URL in browser history', async ({ page }) => {
    // First go to home page
    await page.goto(`${BASE_URL}/`);
    await expect(page.getByText('ALL Products')).toBeVisible();
    
    // Then navigate to non-existent page
    await page.goto(`${BASE_URL}/nonexistent-page`);
    await expect(page.getByText('404')).toBeVisible();
    
    // Go back using browser back button
    await page.goBack();
    
    // Should return to home page
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText('ALL Products')).toBeVisible();
  });

  test('404 page SEO -> should have proper meta tags', async ({ page }) => {
    await page.goto(`${BASE_URL}/nonexistent-page`);
    
    // Check for meta tags from Layout component
    await expect(page.locator('meta[charset="utf-8"][data-react-helmet="true"]')).toHaveCount(1);
    await expect(page.locator('meta[name="description"][data-react-helmet="true"]')).toHaveCount(1);
    await expect(page.locator('meta[name="keywords"][data-react-helmet="true"]')).toHaveCount(1);
    await expect(page.locator('meta[name="author"][data-react-helmet="true"]')).toHaveCount(1);
  });

  test('404 page user experience -> should provide clear navigation path', async ({ page }) => {
    await page.goto(`${BASE_URL}/nonexistent-page`);
    
    // Verify all essential elements are present for good UX
    await expect(page.getByText('404')).toBeVisible(); // Clear error code
    await expect(page.getByText('Oops ! Page Not Found')).toBeVisible(); // Friendly message
    await expect(page.getByRole('link', { name: 'Go Back' })).toBeVisible(); // Clear action
    
    // Verify the go back button is clickable and functional
    const goBackBtn = page.getByRole('link', { name: 'Go Back' });
    await expect(goBackBtn).toBeEnabled();
    
    // Test the navigation
    await goBackBtn.click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('404 page error handling -> should handle malformed URLs gracefully', async ({ page }) => {
    const malformedUrls = [
      '/%20%20%20', // Encoded spaces
      '/page%20with%20spaces',
      '/page-with-special-chars!@#$%',
      '/very/long/nested/path/that/does/not/exist'
    ];
    
    for (const url of malformedUrls) {
      await page.goto(`${BASE_URL}${url}`);
      
      // Should still show 404 page
      await expect(page.getByText('404')).toBeVisible();
      await expect(page.getByText('Oops ! Page Not Found')).toBeVisible();
    }
  });

  test('404 page performance -> should load quickly', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto(`${BASE_URL}/nonexistent-page`);
    
    // Wait for 404 content to be visible
    await expect(page.getByText('404')).toBeVisible();
    
    const endTime = Date.now();
    const loadTime = endTime - startTime;
    
    // Should load within reasonable time (2 seconds)
    expect(loadTime).toBeLessThan(2000);
  });
});
