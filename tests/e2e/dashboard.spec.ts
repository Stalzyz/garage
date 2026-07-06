import { test, expect } from '@playwright/test';

test.describe('Academy Dashboard E2E', () => {
  test('should login and navigate to course builder', async ({ page }) => {
    // 1. Go to dashboard (redirects to login)
    await page.goto('http://localhost:3001/dashboard/');
    
    // 2. Login
    await page.waitForSelector('input[type="email"]');
    await page.fill('input[type="email"]', 'admin@grekam.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("INITIALIZE")'); // Adjust text as needed
    
    // 3. Wait for dashboard load
    await page.waitForURL('**/dashboard**');
    await expect(page.locator('text=Dashboard')).toBeVisible();
    
    // 4. Navigate to Course Builder
    await page.goto('http://localhost:3001/dashboard/studio/online/courses/builder');
    
    // 5. Create new course
    await page.waitForSelector('text=Create New Course');
    await page.fill('input[placeholder="e.g. Advanced Web Architecture"]', 'Automated Test Course');
    await page.fill('input[placeholder="e.g. CS501"]', 'TEST-101');
    await page.click('button:has-text("Create Course")');
    
    // 6. Verify dynamic builder
    await page.waitForURL('**/builder/*');
    await expect(page.locator('text=Automated Test Course')).toBeVisible();
  });
});
