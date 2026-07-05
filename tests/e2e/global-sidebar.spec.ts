import { test, expect } from '@playwright/test';

// Helper to login via the UI using the secure test backdoor
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

test.describe('Global Sidebar Tests', () => {
  test.use({ baseURL: 'http://localhost:3001' }); // Academy web runs on 3001

  test('SUPER_ADMIN role sees correct links', async ({ page }) => {
    await mockSession(page, 'SUPER_ADMIN');
    await page.goto('/dashboard');
    
    // Admin should see CRM, Board, Chat
    await expect(page.getByText('CRM', { exact: true })).toBeVisible();
    await expect(page.getByText('Board', { exact: true })).toBeVisible();
    await expect(page.getByText('Chat', { exact: true })).toBeVisible();
    
    // Admin should NOT see Billing or Alerts
    await expect(page.getByText('Billing', { exact: true })).not.toBeVisible();
    await expect(page.getByText('Alerts', { exact: true })).not.toBeVisible();
  });

  test('STUDENT role sees correct links', async ({ page }) => {
    await mockSession(page, 'STUDENT');
    await page.goto('/dashboard');
    
    await expect(page.getByText('Courses', { exact: true })).toBeVisible();
    await expect(page.getByText('Tasks', { exact: true })).toBeVisible();
    
    await expect(page.getByText('CRM', { exact: true })).not.toBeVisible();
    await expect(page.getByText('Billing', { exact: true })).not.toBeVisible();
  });

  test('CLIENT role sees correct links', async ({ page }) => {
    await mockSession(page, 'CLIENT');
    await page.goto('/dashboard');
    
    await expect(page.getByText('Billing', { exact: true })).toBeVisible();
    await expect(page.getByText('Board', { exact: true })).toBeVisible();
    
    await expect(page.getByText('CRM', { exact: true })).not.toBeVisible();
  });

  test('VENDOR role sees correct links', async ({ page }) => {
    await mockSession(page, 'VENDOR');
    await page.goto('/dashboard');
    
    await expect(page.getByText('Alerts', { exact: true })).toBeVisible();
    await expect(page.getByText('Board', { exact: true })).toBeVisible();
    
    await expect(page.getByText('CRM', { exact: true })).not.toBeVisible();
    await expect(page.getByText('Billing', { exact: true })).not.toBeVisible();
  });
});
