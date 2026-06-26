import { test, expect } from '@playwright/test';

test.describe('Client Portal Experience', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
  });

  test('should navigate to Client Portal and verify dashboard', async ({ page }) => {
    // Navigate to Client Portal Dashboard
    await page.goto('/portal/client');
    
    // Check if the Welcome Header is visible
    await expect(page.locator('h1').first()).toContainText('Welcome back');
    
    // Check if Active Projects section exists
    await expect(page.locator('text=Active Projects').first()).toBeVisible();
    
    // Check if Outstanding Invoices section exists
    await expect(page.locator('text=Outstanding Invoices').first()).toBeVisible();
  });

  test('should navigate to Client Deliverables (Files)', async ({ page }) => {
    await page.goto('/portal/client/files');
    
    // Check for the header
    await expect(page.locator('h1').first()).toContainText('Project Deliverables');
    
    // Either the "No files" text or a file grid will be visible. Both prove the page loaded.
    const fileContainer = page.locator('text=Project Deliverables');
    await expect(fileContainer).toBeVisible();
  });
});
