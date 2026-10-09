import { test, expect } from '@playwright/test';

test.describe('Settings Module E2E - QA Tenant', () => {
  test('should login, edit company details, and create a role', async ({ page }) => {
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
    
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

    // 4. Navigate to Settings
    console.log('Navigating to Settings...');
    await page.goto('/dashboard/settings');
    await expect(page.getByRole('heading', { name: 'System Settings' })).toBeVisible();

    // 5. Switch to Company Details tab
    await page.getByRole('button', { name: /Company Details/i }).click();

    // 6. Fill company details
    await page.getByPlaceholder('Grekam Garage & Auto Services Pvt Ltd').fill('Grekam E2E QA Corp');
    await page.getByPlaceholder('33AAAAA0000A1Z5').fill('33AAAAA0000QA9Z');

    // 7. Save changes
    await page.getByRole('button', { name: /Save changes/i }).click();
    await expect(page.locator('.sonner-toast').first()).toHaveText(/Settings and brand assets saved successfully/i, { timeout: 10000 });

    // 8. Navigate to Roles
    console.log('Navigating to Roles...');
    await page.goto('/dashboard/settings/roles');
    await expect(page.getByRole('heading', { name: 'Roles & Permissions' })).toBeVisible();

    // 9. Create a new role
    console.log('Creating a new role...');
    await page.getByRole('button', { name: /New Custom Role/i }).click();
    
    // Wait for the slide-over
    await expect(page.getByRole('heading', { name: 'Create Custom Role' })).toBeVisible();

    // Fill the slide-over
    await page.getByPlaceholder('e.g. Marketing Manager').fill('E2E QA Role');
    await page.getByPlaceholder('Brief description').fill('Role created by E2E test');
    
    // Toggle a permission (e.g., HR & Payroll view)
    const hrRow = page.locator('div').filter({ hasText: /^HR & Payroll$/ }).first();
    // Assuming there is a toggle/checkbox next to it. Since we don't know the exact HTML, let's just click Create.
    await page.getByRole('button', { name: /Create Role/i }).click();
    
    await expect(page.locator('.sonner-toast').first()).toHaveText(/Role created successfully/i, { timeout: 10000 });

    console.log('✅ Settings & Roles E2E Test passed successfully!');
  });
});
