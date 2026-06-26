import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../.auth/user.json');

setup('authenticate', async ({ page }) => {
  // Perform authentication steps.
  await page.goto('/auth/login');
  
  // Fill in credentials
  await page.getByPlaceholder('m@example.com').fill('admin@grekam.com');
  // There is a standard password field.
  await page.getByPlaceholder('••••••••').fill('admin123');
  
  await page.getByRole('button', { name: /Initialize Session/i }).click();
  
  // Wait until logged in (Welcome back header becomes visible)
  await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible({ timeout: 15000 });
  
  // End of authentication steps.
  await page.context().storageState({ path: authFile });
});
