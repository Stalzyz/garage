import { test, expect } from '@playwright/test';

test.describe('CRM Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
  });

  test('should navigate to CRM and verify Kanban board loads', async ({ page }) => {
    // Navigate to CRM
    await page.goto('/dashboard/crm');
    
    // Check if the page title or a specific header is visible
    await expect(page.locator('h1').first()).toContainText('CRM');
    
    // Verify the Kanban columns are visible
    await expect(page.locator('text=NEW')).toBeVisible();
    await expect(page.locator('text=WON')).toBeVisible();

    // Verify there is at least one lead card visible (our seed script created many)
    const card = page.locator('div[role="button"]').first();
    await expect(card).toBeVisible();
  });
});
