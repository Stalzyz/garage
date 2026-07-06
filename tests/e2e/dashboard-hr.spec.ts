import { test, expect } from '@playwright/test';

test.describe('HR & Dashboard Module E2E', () => {
  test('should navigate directly to HR Personnel Matrix', async ({ page }) => {
    // 0. Mock any API calls needed for the HR hub
    await page.route('**/api/v1/hr/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    // 1. Go to HR dashboard
    await page.goto('/dashboard/hr');
    
    // 2. Wait for page load and verify title
    await expect(page.locator('h1', { hasText: 'Personnel Matrix' })).toBeVisible({ timeout: 15000 });
  });
});
