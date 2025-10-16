import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

const ABOUT_URL = 'http://localhost:3000/about';

test.beforeEach(async ({ page }) => {
  await page.goto(ABOUT_URL);
});

test.describe('About page', () => {
  test('upon loading product page -> should render image', async ({ page }) => {
    await expect(page.getByRole('img', { name: 'contactus' })).toBeVisible();
  });

  test('upon loading product page -> should render text.', async ({ page }) => {
      await expect(page.getByText('Add text')).toBeVisible();
  });

  // From About page, click "Contact" in the footer and land on /contact
  test('testing footer component: Contact link navigates to Contact page', async ({ page }) => {
    const footer = page.locator('.footer');
    await expect(footer).toBeVisible();

    await Promise.all([
      page.waitForURL('**/contact'),
      footer.getByRole('link', { name: /^contact$/i }).click(),
    ]);

    await expect(page).toHaveURL(/\/contact$/);
  });

  // 2) From About page, click "Home" in the header and land on /
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
});
