import { test, expect } from '@playwright/test';

test.describe('CRM & Sales', () => {
  test('Lead Matrix loads', async ({ page }) => {
    // Navigate to CRM
    await page.goto('/dashboard/crm');

    // Verify Title
    await expect(page.getByRole('heading', { name: 'Lead Management', level: 1 })).toBeVisible();

    // Verify KPIs exist
    await expect(page.locator('h3', { hasText: 'Total Agency Leads' })).toBeVisible();
    await expect(page.locator('h3', { hasText: 'Pipeline Value' })).toBeVisible();
  });
});
