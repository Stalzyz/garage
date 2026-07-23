# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: academy-dashboard.spec.ts >> Academy Dashboard Production Tests >> should load the Batches page
- Location: tests/academy-dashboard.spec.ts:26:7

# Error details

```
Test timeout of 90000ms exceeded while running "beforeEach" hook.
```

```
Error: page.click: Test timeout of 90000ms exceeded.
Call log:
  - waiting for locator('button[type="submit"]')
    - locator resolved to <button type="submit" class="relative w-full h-14 flex items-center justify-center gap-3 rounded-2xl font-bold tracking-widest uppercase transition-all overflow-hidden group ${pending ? 'bg-white/10 text-white/50 cursor-not-allowed border border-white/5' : 'bg-white text-black hover:scale-[1.02]'}">…</button>
  - attempting click action
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - performing click action

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Academy Dashboard Production Tests', () => {
  4  |   // Use the e2e backdoor to login
  5  |   test.beforeEach(async ({ page }) => {
  6  |     await page.goto('https://academy.grekam.in/auth/login');
  7  |     // Using actual production credentials
  8  |     await page.fill('input[type="email"]', 'admin@grekam.in');
  9  |     await page.fill('input[type="password"]', 'Medusa09@');
> 10 |     await page.click('button[type="submit"]');
     |                ^ Error: page.click: Test timeout of 90000ms exceeded.
  11 |     // Wait for redirect to dashboard
  12 |     await page.waitForURL('**/dashboard**', { timeout: 10000 });
  13 |   });
  14 | 
  15 |   test('should load the AI Risk Dashboard without crashing', async ({ page }) => {
  16 |     await page.goto('https://academy.grekam.in/dashboard/academy/risk');
  17 |     // Check if main text is there
  18 |     await expect(page.locator('text=AI Risk Dashboard').first()).toBeVisible({ timeout: 10000 });
  19 |   });
  20 | 
  21 |   test('should load the Interactive Proposal Builder', async ({ page }) => {
  22 |     await page.goto('https://academy.grekam.in/dashboard/crm/proposals/new');
  23 |     await expect(page.locator('text=Interactive Proposal Builder').first()).toBeVisible({ timeout: 10000 });
  24 |   });
  25 | 
  26 |   test('should load the Batches page', async ({ page }) => {
  27 |     await page.goto('https://academy.grekam.in/dashboard/academy/batches');
  28 |     await expect(page.locator('text=Batches').first()).toBeVisible({ timeout: 10000 });
  29 |   });
  30 | 
  31 |   test('should load the Attendance admin page', async ({ page }) => {
  32 |     await page.goto('https://academy.grekam.in/dashboard/academy/attendance');
  33 |     await expect(page.locator('text=Attendance').first()).toBeVisible({ timeout: 10000 });
  34 |   });
  35 | });
  36 | 
```