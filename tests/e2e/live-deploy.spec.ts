import { test, expect } from '@playwright/test';

test.describe('Live Production E2E Tests', () => {

  test('garage.grekam.in should load the Split Reality portal', async ({ page }) => {
    console.log('Navigating to https://garage.grekam.in ...');
    await page.goto('https://garage.grekam.in');

    // Wait for the page to fully load and animations to complete
    await page.waitForLoadState('networkidle');

    // Check for the Split Reality headers
    await expect(page.locator('text="01 / AGENCY"')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text="02 / ACADEMY"')).toBeVisible({ timeout: 15000 });
    
    // Check that it's NOT the old UI
    const isOldUIVisible = await page.locator('text="LOGIN / REGISTER"').isVisible();
    expect(isOldUIVisible).toBeFalsy();

    // Take a screenshot of the new UI
    await page.screenshot({ path: 'test-results/garage-live.png', fullPage: true });
  });

  test('academy.grekam.in should load successfully', async ({ page }) => {
    console.log('Navigating to https://academy.grekam.in ...');
    await page.goto('https://academy.grekam.in');

    await page.waitForLoadState('networkidle');

    // Basic check to ensure the page loaded (no 502/404)
    const pageTitle = await page.title();
    console.log(`Academy page title: ${pageTitle}`);
    
    // The page should have some content. We'll capture a screenshot to verify visually
    await page.screenshot({ path: 'test-results/academy-live.png', fullPage: true });
    
    // Ensure there is no Nginx error
    await expect(page.locator('text="502 Bad Gateway"')).not.toBeVisible();
    await expect(page.locator('text="404 Not Found"')).not.toBeVisible();
  });

});
