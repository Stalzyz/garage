import { test, expect } from '@playwright/test';

test.describe('Real-Time Chat Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
  });

  test('should open chat panel and send a message', async ({ page }) => {
    // Navigate to Chat
    await page.goto('/dashboard/chat');
    
    // Check if the chat layout loaded
    await expect(page.locator('text=Messages').first()).toBeVisible();
    
    // Select the first channel/contact if exists, otherwise assume there is a chat input
    // The previous implementation used a sidebar. Let's just click the first contact.
    const firstContact = page.locator('button:has-text("Jane")').first();
    if (await firstContact.isVisible()) {
      await firstContact.click();
    }

    // Locate message input
    const messageInput = page.getByPlaceholder('Type a message...');
    await expect(messageInput).toBeVisible();

    // Type a message
    const testMessage = `E2E Test Message ${Date.now()}`;
    await messageInput.fill(testMessage);
    await messageInput.press('Enter');

    // Verify message appears in the UI
    await expect(page.locator(`text=${testMessage}`)).toBeVisible();
  });
});
