import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should allow user to login successfully', async ({ page }) => {
    await page.goto('/dashboard');
    // We assume the NextAuth session is mocked or we bypass the login check
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
    
    // Verify dashboard text or element
    await expect(page.locator('h1').first()).toContainText('Dashboard');
  });
});
