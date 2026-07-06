import { test, expect } from '@playwright/test';

test.describe('CRM & Agency Module E2E', () => {
  test('should navigate directly to CRM dashboard', async ({ page }) => {
    // 0. Mock any API calls needed for the CRM hub
    await page.route('**/api/v1/crm/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    // 1. Go to CRM dashboard (bypasses NextAuth UI because of layout.tsx edits)
    await page.goto('/dashboard/crm');
    
    // 2. Wait for page load and verify title
    await expect(page.locator('h1', { hasText: 'Lead Management' })).toBeVisible({ timeout: 15000 });
  });
});
