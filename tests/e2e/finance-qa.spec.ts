import { test, expect } from '@playwright/test';

test.describe('Finance Module E2E - QA Tenant', () => {
  test('should login, navigate to Finance, and click New Invoice', async ({ page }) => {
    // 1. Go to login page
    await page.goto('/login');

    // 2. Perform Login
    console.log('Logging in...');
    await page.locator('input[placeholder="admin@grekam.in"]').fill('qa_e2e_admin@grekam.in');
    await page.locator('input[placeholder="••••••••"]').fill('Password123!');
    await page.getByRole('button', { name: /initialize session/i }).click();

    // 3. Verify Dashboard Loads
    console.log('Waiting for dashboard...');
    await expect(page).toHaveURL(/\/dashboard|portal/);

    // 4. Navigate to Finance
    console.log('Navigating to Finance...');
    await page.goto('/dashboard/finance');
    
    // Verify Finance page loaded
    await expect(page.getByRole('heading', { name: /Invoices/i })).toBeVisible({ timeout: 15000 });

    // 5. Click New Invoice
    console.log('Clicking New Invoice...');
    const newInvoiceBtn = page.getByRole('link', { name: /New Invoice/i });
    await newInvoiceBtn.click();

    // 6. Verify URL changes to New Invoice page
    await expect(page).toHaveURL(/\/dashboard\/finance\/invoices\/new/);
    
    console.log('✅ Finance E2E Test passed successfully!');
  });
});
