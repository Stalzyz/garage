import { test, expect } from '@playwright/test';

// Define the base URL where the local academy dashboard is running
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Academy Dashboard Modules', () => {

  test('should load the Proposals Builder page without errors', async ({ page }) => {
    // Navigate to the Proposals Builder
    const response = await page.goto(`${BASE_URL}/dashboard/crm/proposals/new`);
    expect(response?.status()).toBe(200);
    
    // Wait for the main heading to ensure client-side rendering is complete
    await expect(page.locator('text=Interactive Proposal Builder').first()).toBeVisible();
    
    // Check if the add item button is present
    await expect(page.locator('button:has-text("Add Item")').first()).toBeVisible();
  });

  test('should load the Vendors page without errors', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/dashboard/finance/vendors/new`);
    expect(response?.status()).toBe(200);
    
    await expect(page.locator('text=New Vendor').first()).toBeVisible();
    await expect(page.locator('button:has-text("Save Vendor")').first()).toBeVisible();
  });

  test('should load the HR Attendance Dashboard', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/dashboard/hr/attendance`);
    expect(response?.status()).toBe(200);

    await expect(page.locator('text=Staff Attendance').first()).toBeVisible();
    await expect(page.locator('button:has-text("Mark Manual Entry")').first()).toBeVisible();
  });

  test('should load the Staff Kiosk for selfie upload', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/staff/kiosk`);
    expect(response?.status()).toBe(200);

    await expect(page.locator('text=Staff Check-In').first()).toBeVisible();
    await expect(page.locator('button:has-text("Clock In")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Clock Out")').first()).toBeVisible();
  });

  test('should load the Batches page without errors', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/dashboard/academy/batches`);
    expect(response?.status()).toBe(200);

    await expect(page.locator('text=Batches & Cohorts').first()).toBeVisible();
    await expect(page.locator('button:has-text("Create Batch")').first()).toBeVisible();
  });

  test('should load the AI Risk Dashboard', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/dashboard/academy/risk`);
    expect(response?.status()).toBe(200);

    await expect(page.locator('text=AI Risk & Churn Prediction').first()).toBeVisible();
  });

});
