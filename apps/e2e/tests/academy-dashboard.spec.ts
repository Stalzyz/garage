import { test, expect } from '@playwright/test';

test.describe('Academy Dashboard Production Tests', () => {
  // Use the e2e backdoor to login
  test.beforeEach(async ({ page }) => {
    await page.goto('https://academy.grekam.in/auth/login');
    // Using actual production credentials
    await page.fill('input[type="email"]', 'admin@grekam.in');
    await page.fill('input[type="password"]', 'Medusa09@');
    await page.click('button[type="submit"]');
    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
  });

  test('should load the AI Risk Dashboard without crashing', async ({ page }) => {
    await page.goto('https://academy.grekam.in/dashboard/academy/risk');
    // Check if main text is there
    await expect(page.locator('text=AI Risk Dashboard').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load the Interactive Proposal Builder', async ({ page }) => {
    await page.goto('https://academy.grekam.in/dashboard/crm/proposals/new');
    await expect(page.locator('text=Interactive Proposal Builder').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load the Batches page', async ({ page }) => {
    await page.goto('https://academy.grekam.in/dashboard/academy/batches');
    await expect(page.locator('text=Batches').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load the Attendance admin page', async ({ page }) => {
    await page.goto('https://academy.grekam.in/dashboard/academy/attendance');
    await expect(page.locator('text=Attendance').first()).toBeVisible({ timeout: 10000 });
  });
});
