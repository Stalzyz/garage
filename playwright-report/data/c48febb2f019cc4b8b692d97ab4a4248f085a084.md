# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: client-portal.spec.ts >> Client Portal Experience >> should navigate to Client Deliverables (Files)
- Location: tests/e2e/client-portal.spec.ts:23:7

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('h1').first()
Expected substring: "Project Deliverables"
Received string:    "Grekam OS"
Timeout: 15000ms

Call log:
  - Expect "toContainText" with timeout 15000ms
  - waiting for locator('h1').first()
    20 × locator resolved to <h1 class="text-3xl font-bold tracking-tighter mb-2">Grekam OS</h1>
       - unexpected value "Grekam OS"

```

```yaml
- heading "Grekam OS" [level=1]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Client Portal Experience', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('/dashboard');
  6  |     await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
  7  |   });
  8  | 
  9  |   test('should navigate to Client Portal and verify dashboard', async ({ page }) => {
  10 |     // Navigate to Client Portal Dashboard
  11 |     await page.goto('/portal/client');
  12 |     
  13 |     // Check if the Welcome Header is visible
  14 |     await expect(page.locator('h1').first()).toContainText('Welcome back');
  15 |     
  16 |     // Check if Active Projects section exists
  17 |     await expect(page.locator('text=Active Projects').first()).toBeVisible();
  18 |     
  19 |     // Check if Outstanding Invoices section exists
  20 |     await expect(page.locator('text=Outstanding Invoices').first()).toBeVisible();
  21 |   });
  22 | 
  23 |   test('should navigate to Client Deliverables (Files)', async ({ page }) => {
  24 |     await page.goto('/portal/client/files');
  25 |     
  26 |     // Check for the header
> 27 |     await expect(page.locator('h1').first()).toContainText('Project Deliverables');
     |                                              ^ Error: expect(locator).toContainText(expected) failed
  28 |     
  29 |     // Either the "No files" text or a file grid will be visible. Both prove the page loaded.
  30 |     const fileContainer = page.locator('text=Project Deliverables');
  31 |     await expect(fileContainer).toBeVisible();
  32 |   });
  33 | });
  34 | 
```