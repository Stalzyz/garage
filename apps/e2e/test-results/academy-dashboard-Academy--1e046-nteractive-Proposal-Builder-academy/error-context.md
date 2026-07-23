# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: academy-dashboard.spec.ts >> Academy Dashboard Production Tests >> should load the Interactive Proposal Builder
- Location: tests/academy-dashboard.spec.ts:21:7

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

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e4]:
      - generic [ref=e5]:
        - img [ref=e7]
        - heading "Grekam Visuals" [level=1] [ref=e10]
        - paragraph [ref=e11]: Staff Secure Login
      - generic [ref=e12]:
        - generic [ref=e13]:
          - text: System ID (Email)
          - generic [ref=e14]:
            - generic:
              - img
            - textbox "System ID (Email)" [ref=e15]:
              - /placeholder: staff@grekam.com
              - text: admin@grekam.in
        - generic [ref=e16]:
          - generic [ref=e17]:
            - generic [ref=e18]: Passkey
            - link "Recover?" [ref=e19] [cursor=pointer]:
              - /url: /auth/forgot-password
          - generic [ref=e20]:
            - generic:
              - img
            - textbox "Passkey" [active] [ref=e21]:
              - /placeholder: ••••••••
              - text: Medusa09@
        - button "Initialize Session" [ref=e23]:
          - img [ref=e24]
          - text: Initialize Session
          - img [ref=e33]
      - link "Student or Educator? Log in here →" [ref=e37] [cursor=pointer]:
        - /url: /academy/login
    - link "← Return" [ref=e38] [cursor=pointer]:
      - /url: /
  - alert [ref=e39]
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