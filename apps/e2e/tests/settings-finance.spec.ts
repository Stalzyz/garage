import { test, expect } from '@playwright/test';

const API = 'http://localhost:4000/api/v1';

/**
 * E2E Tests: Finance Settings (Currency & Tax)
 *
 * Covers:
 * - /settings/finance page loads
 * - API: GET /settings/finance returns currencySymbol and currencies list
 * - API: PATCH /settings/finance updates currency and reads back
 * - API: taxModel can be updated
 */
test.describe('Finance Settings — Currency & Tax', () => {

  test('Finance Settings page loads', async ({ page }) => {
    await page.goto('/dashboard/settings/finance');
    await expect(page.locator('h1, h2, h3').first()).toBeVisible({ timeout: 10000 });
  });

  test('API: GET /settings/finance returns currencySymbol', async ({ request }) => {
    const res = await request.get(`${API}/settings/finance`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body).toHaveProperty('currencySymbol');
    expect(typeof body.currencySymbol).toBe('string');
  });

  test('API: GET /settings/finance includes currencies list', async ({ request }) => {
    const res = await request.get(`${API}/settings/finance`);
    const body = await res.json();
    expect(Array.isArray(body.currencies)).toBe(true);
    expect(body.currencies.length).toBeGreaterThan(0);

    const first = body.currencies[0];
    expect(first).toHaveProperty('code');
    expect(first).toHaveProperty('symbol');
    expect(first).toHaveProperty('name');
  });

  test('API: PATCH /settings/finance updates currency and reads back', async ({ request }) => {
    // Save original
    const original = await (await request.get(`${API}/settings/finance`)).json();

    // Update to USD
    const patchRes = await request.patch(`${API}/settings/finance`, {
      data: { baseCurrency: 'USD', currencySymbol: '$' },
    });
    expect(patchRes.ok()).toBeTruthy();
    const updated = await patchRes.json();
    expect(updated.currencySymbol).toBe('$');

    // Read back
    const readBack = await (await request.get(`${API}/settings/finance`)).json();
    expect(readBack.currencySymbol).toBe('$');

    // Restore original
    await request.patch(`${API}/settings/finance`, {
      data: {
        baseCurrency: original.baseCurrency || 'INR',
        currencySymbol: original.currencySymbol || '₹',
      },
    });
  });

  test('API: taxModel can be updated', async ({ request }) => {
    const patchRes = await request.patch(`${API}/settings/finance`, {
      data: { taxModel: 'GST' },
    });
    expect(patchRes.ok()).toBeTruthy();
    const body = await patchRes.json();
    expect(body.taxModel).toBe('GST');
  });

});

/**
 * E2E Tests: Proposals CRUD via API
 *
 * NOTE: Audit log entries are only written for AUTHENTICATED requests (with JWT).
 * Direct API requests from E2E tests have no session token, so req.user.id is
 * undefined and audit logging is intentionally skipped. These tests verify the
 * CRUD operations themselves return correct HTTP responses.
 */
test.describe('Proposals — CRUD API', () => {

  test('API: create, update, send, duplicate, and delete a proposal', async ({ request }) => {
    // CREATE
    const createRes = await request.post(`${API}/crm/proposals`, {
      data: {
        title: `E2E Proposal ${Date.now()}`,
        currency: 'INR',
        notes: 'E2E test proposal',
        items: [{ description: 'Design retainer', quantity: 1, unitPrice: 50000, unit: 'month' }],
      },
    });
    expect(createRes.status()).toBe(201);
    const proposal = await createRes.json();
    expect(proposal.id).toBeTruthy();
    expect(proposal.title).toContain('E2E Proposal');
    expect(proposal.totalAmount).toBe(50000);

    // UPDATE status
    const patchRes = await request.patch(`${API}/crm/proposals/${proposal.id}`, {
      data: { status: 'SENT' },
    });
    expect(patchRes.ok()).toBeTruthy();
    const updated = await patchRes.json();
    expect(updated.status).toBe('SENT');

    // SEND — generates publicToken
    const sendRes = await request.post(`${API}/crm/proposals/${proposal.id}/send`);
    expect(sendRes.ok()).toBeTruthy();
    const sent = await sendRes.json();
    expect(sent.publicToken).toBeTruthy();

    // DUPLICATE — creates v+1 copy
    const dupRes = await request.post(`${API}/crm/proposals/${proposal.id}/duplicate`);
    expect(dupRes.status()).toBe(201);
    const dup = await dupRes.json();
    expect(dup.id).not.toBe(proposal.id);
    expect(dup.version).toBe(proposal.version + 1);

    // CLEANUP
    await request.delete(`${API}/crm/proposals/${proposal.id}`);
    await request.delete(`${API}/crm/proposals/${dup.id}`);
  });

  test('API: proposal list returns array with data and total', async ({ request }) => {
    const res = await request.get(`${API}/crm/proposals`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body).toHaveProperty('data');
    expect(body).toHaveProperty('total');
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('API: proposal multi-item total is calculated correctly', async ({ request }) => {
    const res = await request.post(`${API}/crm/proposals`, {
      data: {
        title: `E2E Multi-Item ${Date.now()}`,
        currency: 'INR',
        items: [
          { description: 'Design', quantity: 2, unitPrice: 10000, unit: 'units' },
          { description: 'Dev',    quantity: 1, unitPrice: 20000, unit: 'units' },
        ],
      },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    // totalAmount = 2*10000 + 1*20000 = 40000
    expect(body.totalAmount).toBe(40000);

    // Cleanup
    await request.delete(`${API}/crm/proposals/${body.id}`);
  });

});
