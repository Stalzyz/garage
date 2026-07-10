import { test, expect } from '@playwright/test';
test('Login with real credentials', async ({ page }) => {
  await page.goto('http://localhost:3000/auth/login');
  await page.fill('input[type="email"]', 'admin@grekam.in');
  await page.fill('input[type="password"]', 'Medusa09@');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });
});
