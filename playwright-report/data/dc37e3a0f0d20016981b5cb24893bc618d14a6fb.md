# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: chat.spec.ts >> Real-Time Chat Operations >> should open chat panel and send a message
- Location: tests/e2e/chat.spec.ts:9:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByPlaceholder('Type a message...')
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 15000ms
  - waiting for getByPlaceholder('Type a message...')

```

```yaml
- text: Grekam OS
- button
- text: 00:00:00
- button
- button "Notifications"
- text: Live Intern CLEARANCE
- link "Dashboard":
  - /url: /dashboard
- button "Projects"
- link "Kanban Board":
  - /url: /dashboard/projects
- link "Asset Hub":
  - /url: /dashboard/projects/assets
- button "LMS"
- link "My Courses":
  - /url: /dashboard/lms
- link "Assignments":
  - /url: /dashboard/lms/assignments
- link "Achievements":
  - /url: /dashboard/lms/achievements
- link "Course Builder":
  - /url: /dashboard/lms/builder
- link "Analytics":
  - /url: /dashboard/lms/analytics
- link "Chat Hub":
  - /url: /dashboard/chat
- link "Notifications":
  - /url: /dashboard/notifications
- link "Knowledge Base":
  - /url: /dashboard/kb
- text: U System User
- main:
  - heading "Grekam Internal" [level=2]
  - button
  - text: Channels general engineering Direct Messages JD John Doe AS Alice Smith
  - paragraph: Select a channel or conversation to start chatting
- button
- alert
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Real-Time Chat Operations', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('/dashboard');
  6  |     await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
  7  |   });
  8  | 
  9  |   test('should open chat panel and send a message', async ({ page }) => {
  10 |     // Navigate to Chat
  11 |     await page.goto('/dashboard/chat');
  12 |     
  13 |     // Check if the chat layout loaded
  14 |     await expect(page.locator('text=Messages').first()).toBeVisible();
  15 |     
  16 |     // Select the first channel/contact if exists, otherwise assume there is a chat input
  17 |     // The previous implementation used a sidebar. Let's just click the first contact.
  18 |     const firstContact = page.locator('button:has-text("Jane")').first();
  19 |     if (await firstContact.isVisible()) {
  20 |       await firstContact.click();
  21 |     }
  22 | 
  23 |     // Locate message input
  24 |     const messageInput = page.getByPlaceholder('Type a message...');
> 25 |     await expect(messageInput).toBeVisible();
     |                                ^ Error: expect(locator).toBeVisible() failed
  26 | 
  27 |     // Type a message
  28 |     const testMessage = `E2E Test Message ${Date.now()}`;
  29 |     await messageInput.fill(testMessage);
  30 |     await messageInput.press('Enter');
  31 | 
  32 |     // Verify message appears in the UI
  33 |     await expect(page.locator(`text=${testMessage}`)).toBeVisible();
  34 |   });
  35 | });
  36 | 
```