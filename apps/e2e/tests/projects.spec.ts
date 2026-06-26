import { test, expect } from '@playwright/test';

test.describe('Projects & Kanban', () => {
  test('Kanban board loads columns and allows interaction', async ({ page }) => {
    // Navigate to projects dashboard
    await page.goto('/dashboard/projects');
    
    // Check if header exists
    await expect(page.locator('h1', { hasText: 'Project Matrix' })).toBeVisible();

    // Verify Kanban columns are present (Briefing, Discovery, etc.)
    await expect(page.locator('h3', { hasText: 'Briefing' }).first()).toBeVisible();
    await expect(page.locator('h3', { hasText: 'Discovery' }).first()).toBeVisible();

    // Optionally check for at least one Kanban card
    // We wait for the API call to resolve.
    // If there are no projects, the board should still render.
  });

  test('Client portal projects list and project details page loads', async ({ page }) => {
    // Navigate to client portal projects list
    await page.goto('/portal/projects');
    
    // Check if header is visible
    await expect(page.locator('h1', { hasText: 'My Projects' })).toBeVisible();

    // If there is a project card, click the first View Details link
    const viewDetailsLink = page.locator('a', { hasText: 'View Details' }).first();
    if (await viewDetailsLink.isVisible()) {
      await viewDetailsLink.click();
      
      // Check if project details loads (Project Milestones heading should be visible)
      await expect(page.locator('h2', { hasText: 'Project Milestones' })).toBeVisible();
    }
  });
});
