import { test, expect } from '@playwright/test';

test.describe('Invoices & Razorpay Payment Gateway', () => {
  test('Client portal invoices list and payment sandbox modal works', async ({ page }) => {
    // Navigate to client portal invoices list
    await page.goto('/portal/invoices');
    
    // Verify header is visible
    await expect(page.locator('h1', { hasText: 'Invoices & Billing' })).toBeVisible();

    // Check if there is at least one invoice card with a "Pay Now" button
    const payNowBtn = page.locator('button', { hasText: 'Pay Now' }).first();
    if (await payNowBtn.isVisible()) {
      await payNowBtn.click();
      
      // Verify Sandbox Simulator Modal is visible
      const sandboxHeader = page.locator('span', { hasText: 'Payment Sandbox' });
      await expect(sandboxHeader).toBeVisible();

      // Click "Simulate Success"
      const simulateSuccessBtn = page.locator('button', { hasText: 'Simulate Success' });
      await expect(simulateSuccessBtn).toBeVisible();
      await simulateSuccessBtn.click();

      // Verify simulator modal closes
      await expect(sandboxHeader).toBeHidden({ timeout: 10000 });
    }
  });
});
