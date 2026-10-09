import { test, expect } from '@playwright/test';

test.describe('Admin Module E2E - QA Tenant', () => {
  test('should login, navigate to Admin Garages, and provision a new garage', async ({ page }) => {
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

    // 4. Navigate to Admin Garages
    console.log('Navigating to Admin Garages...');
    await page.goto('/dashboard/admin/garages');
    await expect(page.getByRole('heading', { name: /Garages Directory & Tenancy Control/i })).toBeVisible({ timeout: 15000 });

    // 5. Open Add Garage Modal
    console.log('Opening Add Garage modal...');
    const addBtn = page.getByRole('button', { name: /Add Direct Garage/i });
    await addBtn.click();

    // Wait for modal
    const modalTitle = page.getByText('Add Direct Garage Customer');
    await expect(modalTitle).toBeVisible({ timeout: 10000 });

    // 6. Fill the form
    const uniqueId = Date.now();
    const garageName = `QA_E2E_Garage_${uniqueId}`;
    await page.locator('input[placeholder="e.g. City Central Auto Works"]').fill(garageName);
    await page.locator('input[placeholder="e.g. Manish Sharma"]').fill('QA E2E Owner');
    await page.locator('input[placeholder="e.g. owner@cityautoworks.com"]').fill(`qa_owner_${uniqueId}@qa-grekam.in`);
    await page.locator('input[placeholder="e.g. +91 9876543210"]').fill('+91 9999999999');
    
    // Generate secure pass
    await page.getByText('Generate Secure Pass').click();

    // 7. Submit
    console.log('Submitting new garage...');
    const submitBtn = page.getByRole('button', { name: /Provision Garage/i });
    await submitBtn.click();

    // 8. Verify
    console.log('Verifying garage provisioning...');
    await expect(modalTitle).not.toBeVisible({ timeout: 15000 });
    
    // Search or look for the garage in the table/list
    await expect(page.getByText(garageName)).toBeVisible({ timeout: 15000 });
    
    console.log('✅ Admin E2E Test passed successfully!');
  });
});
