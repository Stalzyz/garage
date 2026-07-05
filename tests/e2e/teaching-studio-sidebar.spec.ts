import { test, expect } from '@playwright/test';

async function mockSession(page: any, role: string) {
  const roleMap: Record<string, string> = {
    'SUPER_ADMIN': 'superadmin@test.com',
    'STUDENT': 'student@test.com',
    'CLIENT': 'client@test.com',
    'VENDOR': 'vendor@test.com',
    'EDUCATOR': 'educator@test.com'
  };
  
  await page.goto('/auth/login');
  await page.fill('input[type="email"]', roleMap[role]);
  await page.fill('input[type="password"]', 'any-password'); // Backdoor ignores password
  await page.click('button[type="submit"]');
  // Wait for redirect to dashboard
  await page.waitForURL('**/dashboard**');
}

test.describe('Teaching Studio Sidebar Tests', () => {
  test.use({ baseURL: 'http://localhost:3001' });

  test('Onsite Studio renders context-specific links', async ({ page }) => {
    await mockSession(page, 'EDUCATOR');
    // Navigate to onsite studio
    await page.goto('/dashboard/studio/onsite');

    // The secondary sidebar should be visible
    const sidebar = page.locator('.w-64.bg-\\[\\#050505\\]\\/90');
    
    // Core links should be visible and pointing to onsite
    const myCourses = sidebar.getByRole('link', { name: 'My Courses' });
    await expect(myCourses).toBeVisible();
    await expect(myCourses).toHaveAttribute('href', '/dashboard/studio/onsite/courses');

    // Context-specific links should be visible
    await expect(sidebar.getByRole('link', { name: 'Live Studio' })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: 'Office Hours' })).toBeVisible();
  });

  test('Online Studio hides context-specific links', async ({ page }) => {
    await mockSession(page, 'EDUCATOR');
    // Navigate to online studio
    await page.goto('/dashboard/studio/online');

    const sidebar = page.locator('.w-64.bg-\\[\\#050505\\]\\/90');
    
    // Core links should be visible and pointing to online
    const myCourses = sidebar.getByRole('link', { name: 'My Courses' });
    await expect(myCourses).toBeVisible();
    await expect(myCourses).toHaveAttribute('href', '/dashboard/studio/online/courses');

    // Context-specific links should be HIDDEN
    await expect(sidebar.getByRole('link', { name: 'Live Studio' })).not.toBeVisible();
    await expect(sidebar.getByRole('link', { name: 'Office Hours' })).not.toBeVisible();
  });
});
