import { test, expect } from '@playwright/test';

test.describe('CRM Module E2E - QA Tenant', () => {
  // Use a longer timeout for the entire suite just in case the VPS is slow
  test.setTimeout(120000);

  test('should login, navigate to CRM, and create a lead', async ({ page }) => {
    // 1. Navigate to the login page
    await page.goto('/login');

    // 2. Perform Login
    console.log('Logging in...');
    await page.locator('input[type="email"]').fill('qa_e2e_admin@grekam.in');
    await page.locator('input[type="password"]').fill('Password123!');
    await page.getByRole('button', { name: /initialize session/i }).click();

    // 3. Verify Dashboard Loads
    console.log('Waiting for dashboard...');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 30000 });
    
    // 4. Navigate to CRM
    console.log('Navigating to CRM...');
    // Try sidebar link or direct navigation
    await page.goto('/dashboard/crm');
    await expect(page).toHaveURL(/\/dashboard\/crm/, { timeout: 15000 });

    // Give the CRM dashboard a moment to fetch and render initial data
    await page.waitForTimeout(3000);

    // 5. Create a new lead
    console.log('Creating new lead...');
    // Find the add button (usually "Add Lead", "Create Lead", "+ Lead", "New Lead")
    const addLeadBtn = page.getByRole('button', { name: /add.*lead|new.*lead|create.*lead/i });
    await expect(addLeadBtn).toBeVisible({ timeout: 10000 });
    await addLeadBtn.click();

    // Wait for the modal/dialog
    const modalTitle = page.getByText('Create New Lead');
    await expect(modalTitle).toBeVisible({ timeout: 10000 });

    // Fill the form
    const leadName = `QA_E2E_TestLead_${Date.now()}`;
    await page.locator('input[placeholder="e.g. Sameer Malhotra"]').first().fill(leadName);
    
    // Attempt to fill email and phone if they exist
    const emailInput = page.locator('input[placeholder="sameer@example.com"]');
    if (await emailInput.isVisible()) {
      await emailInput.fill(`test_${Date.now()}@qa-grekam.in`);
    }

    const phoneInput = page.locator('input[placeholder="+91 98765 43210"]');
    if (await phoneInput.isVisible()) {
      await phoneInput.fill('9999999999');
    }

    // Submit the form
    const submitBtn = page.getByRole('button', { name: /create node|apply changes/i });
    await submitBtn.click();

    // 6. Verify lead appears
    console.log('Verifying lead creation...');
    // Modal should close
    await expect(modalTitle).not.toBeVisible({ timeout: 10000 });

    // The new lead name should be visible on the board/list
    await expect(page.getByText(leadName)).toBeVisible({ timeout: 15000 });
    
    console.log('✅ CRM E2E Test passed successfully!');
  });
});
