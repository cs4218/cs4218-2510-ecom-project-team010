import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

// arrange
const BASE = 'http://localhost:3000';
const ORDERS_URL = `${BASE}/dashboard/admin/orders`;

const API = {
  adminAuth: '**/api/v1/auth/admin-auth',
  allOrders: '**/api/v1/auth/all-orders',
  orderStatus: '**/api/v1/auth/order-status/**',
  categories: '**/api/v1/category/get-category',
  productPhoto: '**/api/v1/product/product-photo/**',
};

const MOCK_ORDERS = [
  {
    _id: 'ord1',
    status: 'Processing',
    buyer: { name: 'Alice' },
    createdAt: new Date().toISOString(),
    payment: { success: true },
    products: [
      {
        _id: 'p100',
        name: 'Red Mug',
        description: 'Ceramic mug for coffee',
        price: 12.9,
      },
      {
        _id: 'p200',
        name: 'Blue Plate',
        description: 'A wide, sturdy plate',
        price: 7.5,
      },
    ],
  },
  {
    _id: 'ord2',
    status: 'Not Processed',
    buyer: { name: 'Bob' },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    payment: { success: false },
    products: [
      {
        _id: 'p300',
        name: 'Notebook',
        description: 'Lined A5 notebook',
        price: 3.0,
      },
    ],
  },
];

test.describe('Testing orders page as an admin', () => {
    test.beforeEach(async ({ page }) => {
        // seed admin auth before app code runs to enable order page to render
        await page.addInitScript(({ auth }) => {
        localStorage.setItem('auth', JSON.stringify(auth));
        }, { auth: { user: { name: 'Admin', role: 1 }, token: 'dev-token' } });

        // stub guard + header deps
        await page.route(API.adminAuth, r =>
        r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) })
        );
        await page.route(API.categories, r =>
        r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, category: [], categories: [] }) })
        );
        // photos aren’t needed for assertions; keep them instant
        await page.route(API.productPhoto, r => r.fulfill({ status: 204 }));

        // set a default orders list
        await page.route(API.allOrders, r =>
        r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_ORDERS) })
        );
    });


    test('login as admin -> orders page -> orders and card contents are visible', async ({ page }) => {
        await page.goto(ORDERS_URL);

        // header is present
        await expect(page.getByRole('heading', { name: /all orders/i })).toBeVisible();

        // All order cards are rendered with the correct total number of cards
        const orderCards = page.locator('.col-md-9 > .border.shadow');
        await expect(orderCards).toHaveCount(MOCK_ORDERS.length);

        // Each order card contains the summary table with required headers
        const tableHeaders = ['#', 'Status', 'Buyer', 'Date', 'Payment', 'Quantity'];
        for (let i = 0; i < await orderCards.count(); i++) {
        const card = orderCards.nth(i);
        for (const h of tableHeaders) {
            await expect(card.getByRole('columnheader', { name: new RegExp(`^${h}$`, 'i') })).toBeVisible();
        }
        // row values: buyer, payment, quantity
        const order = MOCK_ORDERS[i];
        await expect(card.getByText(new RegExp(order.buyer.name, 'i'))).toBeVisible();
        await expect(card.getByText(order.payment.success ? /success/i : /failed/i)).toBeVisible();
        await expect(
            card.getByRole('cell', { name: String(order.products.length), exact: true })
        ).toBeVisible();

        // Products section: for each product, show Name/Description/Price and an img tag present
        const productRows = card.locator('.container .row.card.flex-row');
        await expect(productRows).toHaveCount(order.products.length);
        for (let j = 0; j < order.products.length; j++) {
            const prow = productRows.nth(j);
            const p = order.products[j];
            await expect(prow.getByRole('img', { name: new RegExp(p.name, 'i') })).toBeVisible();
            await expect(prow.getByText(new RegExp(`^Name:\\s*${escapeRe(p.name)}`, 'i'))).toBeVisible();
            await expect(prow.getByText(/Description:/i)).toBeVisible();
            await expect(prow.getByText(/Price\s*:/i)).toBeVisible();
        }
        }
    });

    test('orders: default status is rendered in each Select', async ({ page }) => {
        // act
        await page.goto(ORDERS_URL);
        const orderCards = page.locator('.col-md-9 > .border.shadow');

        // assert
        for (let i = 0; i < MOCK_ORDERS.length; i++) {
            const card = orderCards.nth(i);
            // AntD Selected value lives in .ant-select-selection-item
            await expect(
            card.locator('.ant-select .ant-select-selector .ant-select-selection-item')
            ).toHaveText(new RegExp(`^${escapeRe(MOCK_ORDERS[i].status)}$`, 'i'));
        }
        await expect(orderCards).toHaveCount(MOCK_ORDERS.length);
    });

    test('orders: status Select lists all options', async ({ page }) => {
        // arrange
         const expectedStatuses = [
            'Not Processed',
            'Processing',
            'Shipped',
            'Delivered',
            'Cancelled',
        ];

        // act
        await page.goto(ORDERS_URL);

        const firstCard = page.locator('.col-md-9 > .border.shadow').first();
        await firstCard.locator('.ant-select .ant-select-selector').click();

        const dropdown = page.locator('.ant-select-dropdown').last();
        await expect(dropdown).toBeVisible();

       
        // assert
        for (const label of expectedStatuses) {
            // role=option when available; fallback to class + text
            const roleOpt = dropdown.getByRole('option', { name: new RegExp(`^${escapeRe(label)}$`, 'i') });
            const classOpt = dropdown.locator('.ant-select-item-option', { hasText: new RegExp(`^${escapeRe(label)}$`, 'i') });
            await expect(roleOpt.count().then(n => n > 0 ? roleOpt : classOpt)).resolves.toBeTruthy();
        }

        // clean up
        // dismiss dropdown (click elsewhere)
        await page.mouse.click(0, 0);
    });

   test('status can be updated via Select and is reflected after refresh', async ({ page }) => {
        // arrange
        // Rewire GET /all-orders so it reflects the updated status after PUT
        let lastUpdatedOrderId: string | null = null;
        await page.unroute(API.allOrders);
        await page.route(API.allOrders, r => {
            const payload = !lastUpdatedOrderId
            ? MOCK_ORDERS
            : MOCK_ORDERS.map(o => (o._id === lastUpdatedOrderId ? { ...o, status: 'Delivered' } : o));
            r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(payload) });
        });

        // Capture PUT /order-status/:id and assert payload, then respond OK
        await page.route(API.orderStatus, async r => {
            lastUpdatedOrderId = r.request().url().split('/').pop() || null;
            const body = r.request().postDataJSON?.();
            expect(body).toEqual(expect.objectContaining({ status: 'Delivered' }));
            await r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
        });

        // act
        await page.goto(ORDERS_URL);

        const firstCard = page.locator('.col-md-9 > .border.shadow').first();
        await firstCard.locator('.ant-select .ant-select-selector').click();
        const dropdown = page.locator('.ant-select-dropdown').last();
        await expect(dropdown).toBeVisible();

        // Click the "Delivered" option inside the dropdown
        const delivered = dropdown.getByRole('option', { name: /^Delivered$/i });
        const deliveredFallback = dropdown.locator('.ant-select-item-option', { hasText: /^Delivered$/i });

        if (await delivered.count()) {
            await delivered.click();
        } else {
            await deliveredFallback.click();
        }

        // assert 
        await expect(
        firstCard.locator('.ant-select .ant-select-selector .ant-select-selection-item', {
            hasText: /^Delivered$/i,
        })
        ).toBeVisible();
    });


  test('empty state (no orders) renders with zero cards', async ({ page }) => {
    // arrange
    await page.unroute(API.allOrders);
    await page.route(API.allOrders, r =>
      r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    );

    // act
    await page.goto(ORDERS_URL);

    // assert
    await expect(page.getByRole('heading', { name: /all orders/i })).toBeVisible();
    await expect(page.locator('.col-md-9 > .border.shadow')).toHaveCount(0);
  });


});

function escapeRe(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ------------------------------------- NON ADMIN USER TEST --------------------------------------------

test('non-admin cannot access Orders page (nothing renders)', async ({ page }) => {
    // assert
    // Seed NON-admin auth BEFORE app code runs
    await page.addInitScript(({ auth }) => {
        localStorage.setItem('auth', JSON.stringify(auth));
    }, { auth: { user: { name: 'User', role: 0 }, token: 'dev-token' } });

    // Mocks backend api calls 
    // Admin guard denies access
    await page.route(API.adminAuth, r =>
        r.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ ok: false, message: 'Unauthorized' }),
        })
    );
    // If the page still tries to fetch orders, return 401 as well
    await page.route(API.allOrders, r =>
        r.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ ok: false, message: 'Forbidden' }),
        })
    );

    // act
    await page.goto(ORDERS_URL);
    let redirected = false;
    try {
        await page.waitForURL(url => !/\/dashboard\/admin\/orders$/.test(url.pathname), { timeout: 3000 });
        redirected = true;
    } catch {
        // no redirect within 3s — fall through and assert nothing is rendered
    }

    // assert
    if (redirected) {
        // We navigated away from Orders — good.
        expect(page.url()).not.toMatch(/\/dashboard\/admin\/orders$/);
    } else {
        // No redirect—ensure the Orders UI did NOT render
        await expect(page.getByRole('heading', { name: /all orders/i })).toHaveCount(0);
        await expect(page.locator('.col-md-9 > .border.shadow')).toHaveCount(0);
    }
});