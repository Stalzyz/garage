import { test, expect } from '@playwright/test';

test.describe('LMS Assignments', () => {
  test('Submit assignment protocol', async ({ page }) => {
    await page.goto('/dashboard/lms/assignments');

    // Make sure page loads
    await expect(page.locator('h1', { hasText: 'Assignment Matrix' })).toBeVisible();

    // Find any assignment input
    const submissionInput = page.locator('input[placeholder="Paste your GitHub URL..."]').first();
    
    // Check if input is visible (might be hidden if all assignments are submitted)
    if (await submissionInput.isVisible()) {
      await submissionInput.fill('https://github.com/playwright-test');
      
      const submitBtn = page.getByRole('button', { name: /Submit Protocol/i }).first();
      await submitBtn.click();

      // Wait for submission effect
      await page.waitForTimeout(1000);
    }
  });
});
