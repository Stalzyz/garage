import { test, expect } from '@playwright/test';

test.describe('Projects Module E2E - QA Tenant', () => {
  test('should login, navigate to Projects, and create a project', async ({ page }) => {
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

    // 4. Navigate to Projects
    console.log('Navigating to Projects...');
    await page.goto('/dashboard/projects');
    
    // 5. Open Add Project Modal
    console.log('Opening New Project slideover...');
    const addBtn = page.getByRole('button', { name: /New Project/i });
    await addBtn.click();

    // Wait for slideover
    const modalTitle = page.getByRole('heading', { name: 'New Project' });
    await expect(modalTitle).toBeVisible({ timeout: 10000 });

    // 6. Fill the form
    const uniqueId = Date.now();
    const projectName = `QA_E2E_Proj_${uniqueId}`;
    await page.locator('input[placeholder="e.g. Fleet Overhaul Sprint"]').fill(projectName);
    
    // 7. Submit
    console.log('Submitting new project...');
    const submitBtn = page.getByRole('button', { name: /Create Project/i });
    await submitBtn.click();

    // 8. Verify
    console.log('Verifying project creation...');
    await expect(modalTitle).not.toBeVisible({ timeout: 15000 });
    
    // Check for the project in the UI
    await expect(page.getByText(projectName)).toBeVisible({ timeout: 15000 });
    
    console.log('✅ Projects E2E Test passed successfully!');
  });
});
