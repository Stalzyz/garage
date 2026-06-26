import { test, expect } from '@playwright/test';

test.describe('LMS Gamification & Achievements', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
  });

  test('should navigate to achievements and verify XP and Badges', async ({ page }) => {
    // Navigate to Achievements
    await page.goto('/dashboard/lms/achievements');
    
    // Check if the page title is visible
    await expect(page.locator('h1').first()).toContainText('Achievements');
    
    // Check that XP is displayed (e.g. "XP")
    await expect(page.locator('text=XP')).toBeVisible();

    // Check that some global badges are visible
    await expect(page.locator('text=Quick Starter')).toBeVisible();
    await expect(page.locator('text=Perfect Protocol')).toBeVisible();
    await expect(page.locator('text=First Step')).toBeVisible();
  });
});
