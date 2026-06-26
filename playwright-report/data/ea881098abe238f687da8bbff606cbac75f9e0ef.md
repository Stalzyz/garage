# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: crm.spec.ts >> CRM Operations >> should navigate to CRM and verify Kanban board loads
- Location: tests/e2e/crm.spec.ts:9:7

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('h1').first()
Expected substring: "CRM"
Received string:    "Lead Management"
Timeout: 15000ms

Call log:
  - Expect "toContainText" with timeout 15000ms
  - waiting for locator('h1').first()
    33 × locator resolved to <h1 class="text-3xl font-bold text-white tracking-tight leading-none">Lead Management</h1>
       - unexpected value "Lead Management"

```

```yaml
- heading "Lead Management" [level=1]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('CRM Operations', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('/dashboard');
  6  |     await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
  7  |   });
  8  | 
  9  |   test('should navigate to CRM and verify Kanban board loads', async ({ page }) => {
  10 |     // Navigate to CRM
  11 |     await page.goto('/dashboard/crm');
  12 |     
  13 |     // Check if the page title or a specific header is visible
> 14 |     await expect(page.locator('h1').first()).toContainText('CRM');
     |                                              ^ Error: expect(locator).toContainText(expected) failed
  15 |     
  16 |     // Verify the Kanban columns are visible
  17 |     await expect(page.locator('text=NEW')).toBeVisible();
  18 |     await expect(page.locator('text=WON')).toBeVisible();
  19 | 
  20 |     // Verify there is at least one lead card visible (our seed script created many)
  21 |     const card = page.locator('div[role="button"]').first();
  22 |     await expect(card).toBeVisible();
  23 |   });
  24 | });
  25 | 
```