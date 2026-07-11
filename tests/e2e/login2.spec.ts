import { test, expect } from '@playwright/test';
test('Login with admin backdoor', async ({ page }) => {
  await page.goto('http://localhost:3000/auth/login');
  await page.fill('input[type="email"]', 'admin@grekam.com');
  await page.fill('input[type="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });
});
