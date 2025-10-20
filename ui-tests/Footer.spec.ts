import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

const BASE_URL = 'http://localhost:3000';

test.beforeEach(async ({ page }) => {
  await page.goto(`${BASE_URL}/`);
});

test.describe('Footer component', () => {
  test('upon loading home page -> should render footer with copyright text', async ({ page }) => {
    const footer = page.locator('.footer');
    await expect(footer).toBeVisible();
    await expect(footer.getByText('All Rights Reserved © TestingComp')).toBeVisible();
  });

  test('upon loading home page -> should render footer with navigation links', async ({ page }) => {
    const footer = page.locator('.footer');
    await expect(footer).toBeVisible();
    
    // Check for About link
    await expect(footer.getByRole('link', { name: 'About' })).toBeVisible();
    
    // Check for Contact link
    await expect(footer.getByRole('link', { name: 'Contact' })).toBeVisible();
    
    // Check for Privacy Policy link
    await expect(footer.getByRole('link', { name: 'Privacy Policy' })).toBeVisible();
  });

  test('footer navigation -> About link navigates to About page', async ({ page }) => {
    const footer = page.locator('.footer');
    await expect(footer).toBeVisible();

    await Promise.all([
      page.waitForURL('**/about'),
      footer.getByRole('link', { name: 'About' }).click(),
    ]);

    await expect(page).toHaveURL(/\/about$/);
    // Verify we're on the about page by checking for about page content
    await expect(page.getByRole('img', { name: 'contactus' })).toBeVisible();
  });

  test('footer navigation -> Contact link navigates to Contact page', async ({ page }) => {
    const footer = page.locator('.footer');
    await expect(footer).toBeVisible();

    await Promise.all([
      page.waitForURL('**/contact'),
      footer.getByRole('link', { name: 'Contact' }).click(),
    ]);

    await expect(page).toHaveURL(/\/contact$/);
  });

  test('footer navigation -> Privacy Policy link navigates to Privacy Policy page', async ({ page }) => {
    const footer = page.locator('.footer');
    await expect(footer).toBeVisible();

    await Promise.all([
      page.waitForURL('**/policy'),
      footer.getByRole('link', { name: 'Privacy Policy' }).click(),
    ]);

    await expect(page).toHaveURL(/\/policy$/);
  });

  test('footer structure -> should have proper CSS classes and layout', async ({ page }) => {
    const footer = page.locator('.footer');
    await expect(footer).toBeVisible();
    
    // Check for copyright heading with proper classes
    await expect(footer.locator('h4.text-center')).toBeVisible();
    
    // Check for navigation paragraph with proper classes
    await expect(footer.locator('p.text-center.mt-3')).toBeVisible();
  });

  test('footer content -> should display correct copyright year and company name', async ({ page }) => {
    const footer = page.locator('.footer');
    await expect(footer).toBeVisible();
    
    // Check for exact copyright text
    await expect(footer.getByText('All Rights Reserved © TestingComp')).toBeVisible();
  });

  test('footer links -> should have proper href attributes', async ({ page }) => {
    const footer = page.locator('.footer');
    await expect(footer).toBeVisible();
    
    // Check About link href
    const aboutLink = footer.getByRole('link', { name: 'About' });
    await expect(aboutLink).toHaveAttribute('href', '/about');
    
    // Check Contact link href
    const contactLink = footer.getByRole('link', { name: 'Contact' });
    await expect(contactLink).toHaveAttribute('href', '/contact');
    
    // Check Privacy Policy link href
    const policyLink = footer.getByRole('link', { name: 'Privacy Policy' });
    await expect(policyLink).toHaveAttribute('href', '/policy');
  });

  test('footer accessibility -> should have proper link structure and separators', async ({ page }) => {
    const footer = page.locator('.footer');
    await expect(footer).toBeVisible();
    
    // Check that links are properly separated by pipe characters
    const footerText = await footer.locator('p').textContent();
    expect(footerText).toContain('About|Contact|Privacy Policy');
  });

  test('footer visibility -> should be visible on different pages', async ({ page }) => {
    // Test footer visibility on home page
    await page.goto(`${BASE_URL}/`);
    await expect(page.locator('.footer')).toBeVisible();
    
    // Test footer visibility on about page
    await page.goto(`${BASE_URL}/about`);
    await expect(page.locator('.footer')).toBeVisible();
    
    // Test footer visibility on contact page
    await page.goto(`${BASE_URL}/contact`);
    await expect(page.locator('.footer')).toBeVisible();
  });

  test('footer responsive -> should maintain layout on different viewport sizes', async ({ page }) => {
    const footer = page.locator('.footer');
    await expect(footer).toBeVisible();
    
    // Test on mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(footer).toBeVisible();
    await expect(footer.getByText('All Rights Reserved © TestingComp')).toBeVisible();
    
    // Test on tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(footer).toBeVisible();
    await expect(footer.getByText('All Rights Reserved © TestingComp')).toBeVisible();
    
    // Test on desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(footer).toBeVisible();
    await expect(footer.getByText('All Rights Reserved © TestingComp')).toBeVisible();
  });
});
