import { test, expect } from '@playwright/test';

test.describe('Grekam OS Dashboard E2E', () => {
  
  test('should load the main dashboard overview', async ({ page }) => {
    // Navigate to the main dashboard
    await page.goto('http://localhost:3000/dashboard');
    
    // Expect the page to have the main header
    await expect(page.locator('h1').filter({ hasText: 'Grekam OS Overview' })).toBeVisible();
    
    // Expect revenue metrics to be visible
    await expect(page.getByText('Total Revenue')).toBeVisible();
    await expect(page.getByText('Active Projects')).toBeVisible();
  });

  test('should load the proposal builder', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard/crm/proposals/new');
    
    // Ensure the interactive builder loads
    await expect(page.locator('h1').filter({ hasText: 'Interactive Proposal Builder' })).toBeVisible();
    
    // Check for specific interactive elements
    await expect(page.getByText('Brand Strategy')).toBeVisible();
    await expect(page.getByText('Web Development')).toBeVisible();
  });

  test('should load the HR time tracker', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard/hr/tracker');
    
    // Ensure the tracker loads
    await expect(page.locator('h1').filter({ hasText: 'Live Time Tracker' })).toBeVisible();
    
    // Ensure the play button exists (by finding the text "00:00:00" or similar)
    await expect(page.locator('text=00:00:00')).toBeVisible();
  });

  test('should load the finance invoice builder', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard/finance/invoices/new');
    
    // Ensure the invoice builder loads
    await expect(page.locator('h1').filter({ hasText: 'Invoice Builder' })).toBeVisible();
    
    // Check for line items table
    await expect(page.getByText('Subtotal')).toBeVisible();
    await expect(page.getByText('Tax (18%)')).toBeVisible();
  });

  test('should load the student LMS academy portal', async ({ page }) => {
    await page.goto('http://localhost:3000/academy');
    
    // Ensure the academy loads
    await expect(page.locator('h2').filter({ hasText: 'Mastering Brand Strategy' })).toBeVisible();
    
    // Check for Skill Matrix
    await expect(page.getByText('Your Skill Matrix')).toBeVisible();
  });

});
