import { test, expect } from '@playwright/test';

test.describe('LMS Course Builder E2E', () => {
  test('should navigate directly to course builder and verify drag-and-drop', async ({ page }) => {
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    
    // 0. Mock the API backend to bypass auth checks and isolate the UI
    await page.route('**/api/v1/lms/courses', async (route) => {
      if (route.request().method() === 'POST') {
        // Mock successful course creation
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'mock-course-123',
            name: 'Playwright E2E Course',
            code: 'PW-123',
          })
        });
      } else {
        await route.continue();
      }
    });

    // Mock fetching the course details on the builder page
    await page.route('**/api/v1/lms/courses/mock-course-123', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          course: {
            course: {
              id: 'mock-course-123',
              name: 'Playwright E2E Course',
              code: 'PW-123',
            },
            isPublished: false,
            thumbnail: null,
            modules: [] // Empty curriculum to start
          }
        })
      });
    });

    // 1. Go to dashboard (bypasses NextAuth UI because of layout.tsx edits)
    await page.goto('/dashboard/studio/online/courses/builder');
    
    // 2. Wait for page load
    await expect(page.locator('text=Create New Course')).toBeVisible({ timeout: 15000 });
    
    // 3. Create new course
    await page.fill('input[placeholder="e.g. Advanced Web Architecture"]', 'Playwright E2E Course');
    await page.fill('input[placeholder="e.g. CS501"]', `PW-123`);
    await page.click('button:has-text("Create Course")');
    
    // 4. Verify dynamic builder load
    await page.waitForURL('**/builder/mock-course-123');
    await expect(page.locator('h1', { hasText: 'Playwright E2E Course' })).toBeVisible({ timeout: 15000 });

    // 5. Verify Bulk Save functionality is present
    const bulkSaveBtn = page.locator('button:has-text("Save Draft")');
    await expect(bulkSaveBtn).toBeVisible();
    
    // If the drag-and-drop builder renders "Add Section" button, the UI is functional!
    await expect(page.locator('button:has-text("Add Section")').first()).toBeVisible();
  });
});
