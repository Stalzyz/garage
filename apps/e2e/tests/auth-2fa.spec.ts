import { test, expect, Browser, chromium } from '@playwright/test';

/**
 * E2E Tests: Two-Factor Authentication (2FA) Flow
 *
 * These tests intentionally use a FRESH browser context (no auth cookies)
 * so that the login page is actually rendered rather than redirected away.
 *
 * Covers:
 * - Normal login page renders
 * - Wrong password shows error
 * - Empty form shows validation
 * - Successful login redirects to dashboard
 */
test.describe('2FA Authentication Flow', () => {

  // Helper: open a fresh page with NO stored session
  async function freshPage(browser: Browser) {
    const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await ctx.newPage();
    return { page, ctx };
  }

  test('login page renders all expected elements', async ({ browser }) => {
    const { page, ctx } = await freshPage(browser);

    await page.goto('/auth/login');

    // Email + password fields
    await expect(page.getByPlaceholder('m@example.com')).toBeVisible({ timeout: 10000 });
    await expect(page.getByPlaceholder('••••••••')).toBeVisible();

    // Submit button
    await expect(page.getByRole('button', { name: /Initialize Session/i })).toBeVisible();

    await ctx.close();
  });

  test('wrong password shows error message', async ({ browser }) => {
    const { page, ctx } = await freshPage(browser);

    await page.goto('/auth/login');
    await page.getByPlaceholder('m@example.com').fill('admin@grekam.com');
    await page.getByPlaceholder('••••••••').fill('WRONG_PASSWORD_XYZ_123!');
    await page.getByRole('button', { name: /Initialize Session/i }).click();

    // An error message must appear
    const errorEl = page.locator('[role="alert"], .text-red-400, .text-destructive, p[class*="error"]').first();
    await expect(errorEl).toBeVisible({ timeout: 15000 });

    await ctx.close();
  });

  test('empty email shows HTML5 required validation or JS error', async ({ browser }) => {
    const { page, ctx } = await freshPage(browser);

    await page.goto('/auth/login');

    // Try submitting with empty fields
    await page.getByRole('button', { name: /Initialize Session/i }).click();

    // Either browser native validation (invalid pseudo-class) or a JS error banner
    const nativeInvalid = await page.locator('input:invalid').count();
    const jsError      = await page.locator('[role="alert"], .text-red-400').count();
    expect(nativeInvalid + jsError).toBeGreaterThan(0);

    await ctx.close();
  });

  /**
   * NOTE: The full login→redirect flow is covered by auth.setup.ts (the `authenticate`
   * test which clicks "Initialize Session", waits for the Welcome back header, and
   * saves the session state used by ALL other authenticated tests).
   *
   * Here we verify that the dashboard is accessible WITH a valid session — which
   * proves the full auth flow is working end-to-end.
   */
  test('authenticated session grants dashboard access', async ({ page }) => {
    // This test runs with the auth storage state from auth.setup.ts
    await page.goto('/dashboard');

    // Dashboard should be accessible — middleware allows the session through
    await expect(page).not.toHaveURL(/\/auth\/login/, { timeout: 10000 });
    await expect(page.locator('h1, h2, h3').first()).toBeVisible({ timeout: 10000 });
  });

});
