import { test, expect } from '@playwright/test';

const API = 'http://localhost:4000/api/v1';

/**
 * E2E Tests: Integrations Hub
 *
 * Covers:
 * - Page loads with correct header
 * - Both tabs (API Connections, Webhooks) are accessible
 * - "Add Key" modal opens and closes
 * - Form validation: empty submission is rejected
 * - Service options are present in the select
 * - API endpoint: GET /settings/integrations returns array
 * - API endpoint: POST + DELETE a key round-trip
 */
test.describe('Integrations Hub', () => {

  test('page loads with Integrations Hub heading', async ({ page }) => {
    await page.goto('/dashboard/settings/integrations');
    await expect(page.locator('h1', { hasText: 'Integrations Hub' })).toBeVisible();
  });

  test('API Connections tab shows service cards', async ({ page }) => {
    await page.goto('/dashboard/settings/integrations');
    // Wait for the API fetch to complete (spinner disappears)
    await page.waitForLoadState('networkidle');

    // Tab is active by default
    await expect(page.locator('#tab-api-connections')).toBeVisible({ timeout: 15000 });

    // Service cards are always rendered (even if 0 keys configured)
    await expect(page.locator('text=Razorpay')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=SMTP')).toBeVisible();
    // Use .first() — WhatsApp text appears in both card heading and description
    await expect(page.locator('text=WhatsApp').first()).toBeVisible();
  });

  test('Webhooks tab is accessible', async ({ page }) => {
    await page.goto('/dashboard/settings/integrations');

    await page.locator('#tab-webhooks').click();
    await expect(page.locator('text=Event Webhooks')).toBeVisible();
  });

  test('Add Key button opens the modal', async ({ page }) => {
    await page.goto('/dashboard/settings/integrations');

    await page.locator('#add-integration-btn').click();

    // Modal title visible
    await expect(page.locator('text=Add Integration Key')).toBeVisible();

    // Service select, key name input, secret input all visible
    await expect(page.locator('#integration-service-select')).toBeVisible();
    await expect(page.locator('#integration-key-name')).toBeVisible();
    await expect(page.locator('#integration-key-value')).toBeVisible();
  });

  test('modal has all 6 supported services in select', async ({ page }) => {
    await page.goto('/dashboard/settings/integrations');
    await page.locator('#add-integration-btn').click();

    const options = page.locator('#integration-service-select option');
    await expect(options).toHaveCount(6);

    const services = await options.allTextContents();
    expect(services).toContain('Razorpay');
    expect(services).toContain('Stripe');
    expect(services).toContain('SMTP');
    expect(services).toContain('WhatsApp');
  });

  test('modal cancel closes the modal', async ({ page }) => {
    await page.goto('/dashboard/settings/integrations');
    await page.locator('#add-integration-btn').click();
    await expect(page.locator('text=Add Integration Key')).toBeVisible();

    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.locator('text=Add Integration Key')).toBeHidden();
  });

  test('submitting empty form shows error', async ({ page }) => {
    await page.goto('/dashboard/settings/integrations');
    await page.waitForLoadState('networkidle');

    await page.locator('#add-integration-btn').click();
    await expect(page.locator('text=Add Integration Key')).toBeVisible();

    // Click save without filling anything
    await page.locator('#integration-save-btn').click();

    // Error message appears in both toast and modal paragraph — use first()
    await expect(page.locator('text=Key name and value are required').first()).toBeVisible({ timeout: 5000 });
  });

  // ── API-level tests (direct fetch against the running API) ─────────────────

  test('API: GET /settings/integrations returns an array', async ({ request }) => {
    const res = await request.get(`${API}/settings/integrations`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test('API: POST then DELETE integration key round-trip', async ({ request }) => {
    // Create
    const createRes = await request.post(`${API}/settings/integrations`, {
      data: {
        service: 'SMTP',
        keyName: 'E2E_TEST_KEY',
        value:   'e2e-test-secret-value-do-not-use',
        isActive: true,
      },
    });
    expect(createRes.ok()).toBeTruthy();
    const created = await createRes.json();
    expect(created.id).toBeTruthy();
    expect(created.keyName).toBe('E2E_TEST_KEY');

    // The encryptedValue returned should be masked (not the raw value)
    expect(created.encryptedValue).not.toBe('e2e-test-secret-value-do-not-use');

    // Delete
    const deleteRes = await request.delete(`${API}/settings/integrations/${created.id}`);
    expect(deleteRes.status()).toBe(204);
  });

});
