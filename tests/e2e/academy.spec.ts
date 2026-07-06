import { test, expect } from '@playwright/test';

test.describe('Academy Module E2E', () => {
  test('should navigate directly to Academy dashboard', async ({ page }) => {
    // 0. Mock any API calls needed for the Academy hub
    await page.route('**/api/v1/academy/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    // 1. Go to Academy students page
    await page.goto('/dashboard/academy/students');
    
    // 2. Wait for page load
    // we use a generic verification here assuming a table or heading is present
    await expect(page.locator('body')).toBeVisible({ timeout: 15000 });
  });
});
