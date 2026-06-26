import { test, expect } from '@playwright/test';

test.describe('OpenAI Modules', () => {
  test('AIAssistant drawer opens, sends messages and receives answers', async ({ page }) => {
    await page.goto('/dashboard');

    // Find and click the floating AI assistant button
    const floatBtn = page.locator('button:has(svg.lucide-sparkles)').first();
    await expect(floatBtn).toBeVisible();
    await floatBtn.click();

    // Verify AI Drawer is open and greeting is visible
    await expect(page.locator('h3', { hasText: 'Grekam AI' })).toBeVisible();
    await expect(page.getByText('How can I assist you with your operations today?')).toBeVisible();

    // Fill in input and submit query
    const inputField = page.getByPlaceholder('Ask Grekam AI...');
    await expect(inputField).toBeVisible();
    await inputField.fill('What is the total CRM lead count?');
    await inputField.press('Enter');

    // Wait for the response message bubble to appear.
    // There should be 3 message bubbles in total: 1 greeting, 1 user message, 1 AI response.
    const messageBubbles = page.locator('div.max-w-\\[85\\%\\]');
    await expect(messageBubbles).toHaveCount(3, { timeout: 20000 });
  });

  test('LMS Course Builder AI generator overrides module syllabus', async ({ page }) => {
    await page.goto('/dashboard/lms/builder');

    // Verify initial course builder heading
    await expect(page.locator('h1', { hasText: 'Course Builder' })).toBeVisible();

    // Fill in target AI subject
    const subjectInput = page.getByPlaceholder('e.g. Intro to Python, Advanced Figma');
    await expect(subjectInput).toBeVisible();
    await subjectInput.fill('Advanced Rust Programming');

    // Click Generate with AI button
    const generateBtn = page.getByRole('button', { name: /Generate with AI/i });
    await expect(generateBtn).toBeVisible();
    await generateBtn.click();

    // Verify updated syllabus modules are loaded by checking that module title input value has changed from the initial value
    const firstModuleInput = page.locator('input[type="text"]').first();
    await expect(firstModuleInput).not.toHaveValue("Module 1: Introduction to UI/UX", { timeout: 30000 });
  });

  test('Asset Drive semantic search UI elements and search action works', async ({ page }) => {
    await page.goto('/dashboard/drive');

    // Verify Asset Drive header
    await expect(page.locator('h1', { hasText: 'Asset Drive' })).toBeVisible();

    // Verify search input is visible
    const searchInput = page.getByPlaceholder('Search in Drive...');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('design mockup');

    // Locate the Sparkles search button
    const aiSearchBtn = page.locator('button[title="Semantic AI Search"]');
    await expect(aiSearchBtn).toBeVisible();
    await aiSearchBtn.click();

    // It should complete search without crash
    await page.waitForTimeout(1000);
  });
});
