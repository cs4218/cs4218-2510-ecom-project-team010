import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

// arrange
const BASE = 'http://localhost:3000';
const PRODUCTS_URL = `${BASE}/dashboard/admin/products`;

const API = {
  adminAuth: '**/api/v1/auth/admin-auth',
  categories: '**/api/v1/category/get-category',
  productList: '**/api/v1/product/get-product',
  productPhoto: '**/api/v1/product/product-photo/**',
  // adjust if your update endpoint name differs:
  productUpdate: '**/api/v1/product/update-product/**',
  singleProduct: '**/api/v1/product/get-product/**',
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

test.describe('Products List', () => {
  test('upon login as admin -> products page -> should render cards for each product (count, title, image, link)', async ({ page }) => {
    // act
    await page.goto(PRODUCTS_URL);

    // assert
    // correct number of cards rendered
    const cards = page.locator('.card.m-2');
    await expect(cards).toHaveCount(FIXTURE_PRODUCTS.length);

    // links for reach card are correctly rendered
    await expect(page.locator('a.product-link')).toHaveCount(FIXTURE_PRODUCTS.length);

    // title for reach card are correctly rendered
    await expect(page.locator('.card-title')).toHaveText(FIXTURE_PRODUCTS.map(p => p.name));

    // image for reach card are correctly rendered
    const first = cards.first();
    await expect(first.getByRole('img', { name: FIXTURE_PRODUCTS[0].name })).toHaveAttribute(
      'src',
      `/api/v1/product/product-photo/${FIXTURE_PRODUCTS[0]._id}`
    );
  });

  test('upon login as admin -> products page -> should handle empty state (no products)', async ({ page }) => {
    // arrrange
    await routeProductListWith(page, []); 

    // act
    await page.goto(PRODUCTS_URL);

    // assert
    await expect(page.locator('.card.m-2')).toHaveCount(0);
  });
});


test.describe('Product Editing', () => {
  test('login as admin -> product page -> click card -> edit description -> saved description reflected on product page', async ({ page }) => {
    // in-memory product state we control for this test
    const state = {
      product: { ...FIXTURE_PRODUCTS[0] },
    };

    // mocking backend api calls so do not have to rely on real backend which would result in 
    // brittle tests 
    // Override the products list for THIS test, so it reflects the updated description later
    await page.unroute(API.productList).catch(() => {});
    await page.route(API.productList, r => r.fulfill(json200({ products: [state.product] })));

    // The edit page fetches a single product by slug
    await page.route(API.singleProduct, r => {
      const slug = new URL(r.request().url()).pathname.split('/').pop()!;
      if (slug === state.product.slug) {
        r.fulfill(json200({ product: state.product }));
      } else {
        r.fulfill(json200({ product: null }));
      }
    });

    // The update endpoint is multipart; pull out "description" and update our in-memory product
    await page.route(API.productUpdate, async r => {
      const id = new URL(r.request().url()).pathname.split('/').pop()!;
      if (id === state.product._id) {
        const raw = r.request().postData() || '';
        const newDesc = extractFieldFromMultipart(raw, 'description');
        if (typeof newDesc === 'string') {
          state.product = { ...state.product, description: newDesc };
        }
        await r.fulfill(json200({ success: true }));
      } else {
        await r.fulfill(json200({ success: false }));
      }
    });

    // Go to list and assert initial description
    await page.goto(PRODUCTS_URL);
    const firstCard = page.locator('.card.m-2').first();
    await expect(firstCard.locator('.card-title')).toHaveText(state.product.name);
    await expect(firstCard.locator('.card-text')).toHaveText(state.product.description);

    // Click card to open edit page
    const firstLink = page.locator('a.product-link').first();
    await Promise.all([
      page.waitForURL(new RegExp(`/dashboard/admin/product/${state.product.slug}$`)),
      firstLink.click(),
    ]);

    // Edit description and save
    const textarea = page.getByPlaceholder(/product description/i);
    const NEW_DESC = 'A very nice red mug for testing';
    await textarea.fill(NEW_DESC);
    await page.getByRole('button', { name: /update product/i }).click();

    // The page navigates back to products after save
    await page.waitForURL(/\/dashboard\/admin\/products$/);

    // Confirm the list shows the updated description
    const updatedCard = page.locator('.card.m-2').first();
    await expect(updatedCard.locator('.card-title')).toHaveText(state.product.name);
    await expect(updatedCard.locator('.card-text')).toHaveText(NEW_DESC);
  });

  test('login as admin -> product page -> click card -> edit title -> saved title reflected on product page', async ({ page }) => {
  // in-memory product state we control for this test
  const state = {
    product: { ...FIXTURE_PRODUCTS[0] }, // start from your first fixture
  };

  // Override the products list for THIS test, so it reflects the updated name later
  await page.unroute(API.productList).catch(() => {});
  await page.route(API.productList, r => r.fulfill(json200({ products: [state.product] })));

  // The edit page fetches a single product by slug
  await page.route(API.singleProduct, r => {
    const slug = new URL(r.request().url()).pathname.split('/').pop()!;
    if (slug === state.product.slug) {
      r.fulfill(json200({ product: state.product }));
    } else {
      r.fulfill(json200({ product: null }));
    }
  });

  // The update endpoint is multipart; pull out "name" and update our in-memory product
  await page.route(API.productUpdate, async r => {
    const id = new URL(r.request().url()).pathname.split('/').pop()!;
    if (id === state.product._id) {
      const raw = r.request().postData() || '';
      const newName = extractFieldFromMultipart(raw, 'name'); // <-- grab title
      if (typeof newName === 'string') {
        state.product = { ...state.product, name: newName };
      }
      await r.fulfill(json200({ success: true }));
    } else {
      await r.fulfill(json200({ success: false }));
    }
  });

  // Go to list and assert initial title on the card
  await page.goto(PRODUCTS_URL);
  const firstCard = page.locator('.card.m-2').first();
  await expect(firstCard.locator('.card-title')).toHaveText(state.product.name);

  // Click card to open edit page
  const firstLink = page.locator('a.product-link').first();
  await Promise.all([
    page.waitForURL(new RegExp(`/dashboard/admin/product/${state.product.slug}$`)),
    firstLink.click(),
  ]);

  // Edit title (Product Name input) and save
  const nameInput = page.getByPlaceholder(/product name/i);
  const NEW_NAME = 'Red Mug (Limited Edition)';
  await nameInput.fill(NEW_NAME);
  await page.getByRole('button', { name: /update product/i }).click();

  // The page navigates back to products after save
  await page.waitForURL(/\/dashboard\/admin\/products$/);

  // Confirm the list shows the updated title
  const updatedCard = page.locator('.card.m-2').first();
  await expect(updatedCard.locator('.card-title')).toHaveText(NEW_NAME);
});

});



test.describe('Navigation', () => {
  test('login as admin -> product page -> select product card -> should navigate into product detail page', async ({ page }) => {
    // act
    await page.goto(PRODUCTS_URL);

    const links = page.locator('a.product-link');
    await expect(links).toHaveCount(FIXTURE_PRODUCTS.length);

    await Promise.all([
      page.waitForURL(new RegExp(`/dashboard/admin/product/${FIXTURE_PRODUCTS[0].slug}$`)),
      links.first().click(),
    ]);

    // assert
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

function extractFieldFromMultipart(raw: string, field: string): string | undefined {
  // Grab the field value from multipart/form-data
  const re = new RegExp(`name="${field}"\\s*\\r?\\n\\r?\\n([\\s\\S]*?)\\r?\\n--`, 'm');
  const m = raw.match(re);
  return m ? m[1].trim() : undefined;
}
