import { test, expect } from '@playwright/test';

test.describe('Global Analytics (God View)', () => {
  test('Renders ROI Multiplier and metrics', async ({ page }) => {
    await page.goto('/dashboard/analytics');

    // Verify Title
    await expect(page.locator('h1', { hasText: 'The God View' })).toBeVisible();

    // Verify the "Payroll vs Revenue" section exists
    await expect(page.locator('h2', { hasText: 'Payroll vs Revenue' })).toBeVisible();

    // Verify the ROI Multiplier isn't NaN
    const roiText = await page.locator('.text-4xl.font-black', { hasText: 'x' }).first().textContent();
    expect(roiText).not.toContain('NaN');
    
    // Check Total Payroll value
    const payrollText = await page.locator('div', { hasText: 'Total Payroll' }).locator('xpath=following-sibling::div').first().textContent();
    expect(payrollText).not.toBeNull();
  });
});
