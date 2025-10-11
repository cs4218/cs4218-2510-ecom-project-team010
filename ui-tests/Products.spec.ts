import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

const BASE = 'http://localhost:3000';
const PRODUCTS_URL = `${BASE}/dashboard/admin/products`;

const API = {
  adminAuth: '**/api/v1/auth/admin-auth',
  categories: '**/api/v1/category/get-category',
  productList: '**/api/v1/product/get-product',
  productPhoto: '**/api/v1/product/product-photo/**',
  // adjust if your update endpoint name differs:
  productUpdate: '**/api/v1/product/update-product/**',
};

const FIXTURE_PRODUCTS = [
  { _id: 'p1', name: 'Red Mug',   slug: 'red-mug',   description: 'Ceramic mug',       quantity: 10 },
  { _id: 'p2', name: 'Blue Plate',slug: 'blue-plate',description: 'Wide sturdy plate', quantity: 5  },
  { _id: 'p3', name: 'Notebook',  slug: 'notebook',  description: 'A5 lined',          quantity: 20 },
];

test.beforeEach(async ({ page }) => {
  // log in as admin
  await seedAdminAuth(page);

  // Allow admin page to render
  await page.route(API.adminAuth, r => r.fulfill(json200({ ok: true })));
  await page.route(API.categories, r => r.fulfill(json200({ success: true, category: [], categories: [] })));

  // Avoid slow image fetches (we only assert presence/attrs)
  await page.route(API.productPhoto, r => r.fulfill({ status: 204 }));

  // Default list response
  await routeProductListWith(page, FIXTURE_PRODUCTS);
});

/* ===========================================================
   Products List
   =========================================================== */

test.describe('Products List', () => {
  test('should render cards for each product (count, title, image, link)', async ({ page }) => {
    await page.goto(PRODUCTS_URL);

    // Heading visible
    await expect(page.getByRole('heading', { name: /all products list/i })).toBeVisible();

    // Card count equals mocked length
    const cards = page.locator('.card.m-2');
    await expect(cards).toHaveCount(FIXTURE_PRODUCTS.length);

    // Card structure checks (titles, images, links)
    await expect(page.locator('a.product-link')).toHaveCount(FIXTURE_PRODUCTS.length);

    // Check all titles in one go (like TodoMVC does)
    await expect(page.locator('.card-title')).toHaveText(FIXTURE_PRODUCTS.map(p => p.name));

    // First image has correct src + alt
    const first = cards.first();
    await expect(first.getByRole('img', { name: FIXTURE_PRODUCTS[0].name })).toHaveAttribute(
      'src',
      `/api/v1/product/product-photo/${FIXTURE_PRODUCTS[0]._id}`
    );
  });

  test('should handle empty state (no products)', async ({ page }) => {
    await routeProductListWith(page, []); // override fixture
    await page.goto(PRODUCTS_URL);

    await expect(page.getByRole('heading', { name: /all products list/i })).toBeVisible();
    await expect(page.locator('.card.m-2')).toHaveCount(0);
    // container is present (even if hidden)
    await expect(page.locator('.col-md-9 .d-flex')).toHaveCount(1);
    // optionally assert the column shows the heading
    await expect(page.getByRole('heading', { name: /all products list/i })).toBeVisible()
  });
});

/* ===========================================================
   Product Editing (idempotent)
   =========================================================== */

// test.describe('Product Editing', () => {
//   test('should open first product, bump quantity by +1, persist, then revert', async ({ page }) => {
//     // We simulate a backend that accepts update and then returns the new quantity
//     const productMap = new Map(FIXTURE_PRODUCTS.map(p => [p._id, { ...p }]));

//     await page.unroute(API.productList);
//     await page.route(API.productList, r => {
//       r.fulfill(json200({ products: [...productMap.values()] }));
//     });

//     await page.route(API.productUpdate, async r => {
//       // Example: PUT /update-product/:id with JSON body { quantity: X } (adjust if yours differs)
//       const url = new URL(r.request().url());
//       const id = url.pathname.split('/').pop()!;
//       const body = r.request().postDataJSON?.() ?? {};
//       if (typeof body.quantity === 'number' && productMap.has(id)) {
//         productMap.set(id, { ...productMap.get(id)!, quantity: body.quantity });
//       }
//       await r.fulfill(json200({ ok: true }));
//     });

//     await page.goto(PRODUCTS_URL);

//     // open the first product generically
//     const firstLink = page.locator('a.product-link').first();
//     await Promise.all([
//       page.waitForURL(/\/dashboard\/admin\/product\//),
//       firstLink.click(),
//     ]);

//     const qty = page.getByPlaceholder(/product quantity/i);
//     await expect(qty).toBeVisible();

//     const original = parseInt(await qty.inputValue() || '0', 10);
//     const next = isNaN(original) ? 1 : original + 1;

//     // Update -> Save
//     await qty.fill(String(next));
//     await page.getByRole('button', { name: /update product/i }).click();

//     // Reload to verify persistence
//     await page.reload();
//     await expect(qty).toHaveValue(String(next));

//     // Revert -> Save -> Verify
//     await qty.fill(String(original));
//     await page.getByRole('button', { name: /update product/i }).click();
//     await page.reload();
//     await expect(qty).toHaveValue(String(original));
//   });
// });

/* ===========================================================
   Navigation
   =========================================================== */

test.describe('Navigation', () => {
  test('should navigate into product detail when clicking card link', async ({ page }) => {
    await page.goto(PRODUCTS_URL);

    const links = page.locator('a.product-link');
    await expect(links).toHaveCount(FIXTURE_PRODUCTS.length);

    await Promise.all([
      page.waitForURL(new RegExp(`/dashboard/admin/product/${FIXTURE_PRODUCTS[0].slug}$`)),
      links.first().click(),
    ]);
    await expect(page).toHaveURL(new RegExp(`${FIXTURE_PRODUCTS[0].slug}$`));
  });
});

/* -------------------- helpers (style-matched) -------------------- */

async function seedAdminAuth(page: Page) {
  await page.addInitScript(({ auth }) => {
    localStorage.setItem('auth', JSON.stringify(auth));
  }, { auth: { user: { name: 'Admin', role: 1 }, token: 'dev-token' } });
}

function json200(body: unknown) {
  return { status: 200, contentType: 'application/json', body: JSON.stringify(body) };
}

async function routeProductListWith(page: Page, products: Array<{ _id: string; name: string; slug: string; description: string }>) {
  await page.unroute?.(API.productList).catch?.(() => {});
  await page.route(API.productList, r => r.fulfill(json200({ products })));
}
