import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

const POLICY_URL = 'http://localhost:3000/policy';
const COPY = /commited to selling you products of the highest quality for reasonable prices/i;
const IMG_ALT = /contactus/i;
const IMG_SRC = '/images/contactus.jpeg';

test.beforeEach(async ({ page }) => {
  await page.goto(POLICY_URL);
});

test.describe('Policy page', () => {
  test('upon loading product page -> should render title', async ({ page }) => {
    // Title
    await expect(page).toHaveTitle(/privacy policy/i);
  });

  test('upon loading product page -> should render image + text.', async ({ page }) => {
  // Image present and with correct src
    const img = page.getByRole('img', { name: IMG_ALT });
    await expect(img).toBeVisible();
    await expect(img).toHaveAttribute('src', IMG_SRC);

    // Text visible
    await expect(page.getByText(COPY)).toBeVisible();
  });

  // From Policy page, click "Contact" in the footer and land on /contact
  test('testing footer component: Contact link navigates to Contact page', async ({ page }) => {
    const footer = page.locator('.footer');
    await expect(footer).toBeVisible();

    await Promise.all([
      page.waitForURL('**/contact'),
      footer.getByRole('link', { name: /^contact$/i }).click(),
    ]);

    await expect(page).toHaveURL(/\/contact$/);
  });

  // 2) From Policy page, click "Home" in the header and land on /
  test('header: Home link navigates to Home page', async ({ page }) => {
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