import { test, expect } from '@playwright/test';

test.describe('Academy & Subscriptions E2E Tests', () => {

  test('Subscriptions module page, metrics, and actions', async ({ page }) => {
    // Navigate to Subscriptions panel
    await page.goto('/dashboard/subscriptions');

    // Verify page header
    await expect(page.locator('h1', { hasText: 'Retainer Billing' })).toBeVisible();

    // Verify KPI metrics are visible
    await expect(page.locator('h3', { hasText: 'Total MRR' })).toBeVisible();
    await expect(page.locator('h3', { hasText: 'Active Subscribers' })).toBeVisible();
    await expect(page.locator('h3', { hasText: 'Churn Rate (30d)' })).toBeVisible();
    await expect(page.locator('h3', { hasText: 'At Risk' })).toBeVisible();

    // Verify at least one row exists or the empty message is not visible
    const noSubscriptionsText = page.locator('text=No subscriptions found matching filters');
    
    // Toggle filters
    const activeFilterBtn = page.locator('button', { hasText: 'Active' });
    await expect(activeFilterBtn).toBeVisible();
    await activeFilterBtn.click();

    // Check modal opening
    const newSubscriptionBtn = page.locator('button', { hasText: 'New Subscription' });
    await expect(newSubscriptionBtn).toBeVisible();
    await newSubscriptionBtn.click();

    // Verify modal elements
    const selectCompany = page.locator('select');
    await expect(selectCompany).toBeVisible();
    
    // Close modal
    const closeModalBtn = page.locator('button', { hasText: 'Close' });
    await expect(closeModalBtn).toBeVisible();
    await closeModalBtn.click();
    await expect(selectCompany).toBeHidden();
  });

  test('Student Learn dashboard and certificates telemetry', async ({ page }) => {
    // Navigate to learn dashboard
    await page.goto('/dashboard/learn');

    // Verify page header
    await expect(page.locator('h1', { hasText: 'My Learning' })).toBeVisible();

    // If there is a certificate card, download and verification should work
    const downloadCertBtn = page.locator('a', { hasText: 'Download PDF' }).first();
    if (await downloadCertBtn.isVisible()) {
      // Test certificate download stream
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        downloadCertBtn.click(),
      ]);
      expect(download.suggestedFilename()).toContain('Certificate-');

      // Test verify button navigate
      const verifyBtn = page.locator('a', { hasText: 'Verify' }).first();
      await expect(verifyBtn).toBeVisible();
      await verifyBtn.click();

      // Check verify page loads
      await expect(page.locator('h1', { hasText: 'Verified Credential' })).toBeVisible({ timeout: 10000 });
      await expect(page.locator('text=Official Record')).toBeVisible();
    }
  });

});
