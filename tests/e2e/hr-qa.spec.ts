import { test, expect } from '@playwright/test';

test.describe('HR Module E2E - QA Tenant', () => {
  test('should login, navigate to HR Leaves, and request a leave', async ({ page }) => {
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
    page.on('response', async (response) => {
      if (response.url().includes('hr/leaves') && response.request().method() === 'POST') {
        const body = await response.text();
        console.log(`HR LEAVES API STATUS: ${response.status()}`);
        console.log(`HR LEAVES API RESPONSE: ${body}`);
      }
    });
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

    // 4. Navigate to HR Leaves
    console.log('Navigating to HR Leaves...');
    await page.goto('/dashboard/hr/leaves');
    
    // 5. Open Request Leave Modal
    console.log('Opening Request Leave modal...');
    const addBtn = page.getByRole('button', { name: /Request Leave/i });
    await addBtn.click();

    // Wait for modal
    const modalTitle = page.getByRole('heading', { name: 'Request Leave' });
    await expect(modalTitle).toBeVisible({ timeout: 10000 });

    // 6. Fill the form
    // Wait for the employee dropdown to populate
    const employeeSelect = page.locator('select').nth(1);
    await expect(employeeSelect.locator('option').nth(1)).toBeAttached({ timeout: 15000 });
    await employeeSelect.selectOption({ index: 1 }); // select first employee if available
    
    await page.locator('input[type="date"]').first().fill('2026-10-10');
    await page.locator('input[type="date"]').nth(1).fill('2026-10-12');
    await page.locator('input[type="number"]').fill('3');
    await page.getByPlaceholder(/explanation/i).fill('Sick leave for E2E testing');

    // 7. Submit
    console.log('Submitting leave request...');
    const submitBtn = page.getByRole('button', { name: /Submit Request/i });
    await submitBtn.click();

    // 8. Verify
    console.log('Verifying leave request submission...');
    await expect(modalTitle).not.toBeVisible({ timeout: 15000 });
    
    console.log('✅ HR Leaves E2E Test passed successfully!');
  });
});
