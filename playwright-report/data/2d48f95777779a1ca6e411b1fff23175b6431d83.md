# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Authentication >> should allow user to login successfully
- Location: tests/e2e/auth.spec.ts:4:7

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('h1').first()
Expected substring: "Dashboard"
Received string:    "Welcome back, Commander"
Timeout: 15000ms

Call log:
  - Expect "toContainText" with timeout 15000ms
  - waiting for locator('h1').first()
    33 × locator resolved to <h1 class="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">…</h1>
       - unexpected value "Welcome back, Commander"

```

```yaml
- heading "Welcome back, Commander" [level=1]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Authentication', () => {
  4  |   test('should allow user to login successfully', async ({ page }) => {
  5  |     await page.goto('/dashboard');
  6  |     // We assume the NextAuth session is mocked or we bypass the login check
  7  |     await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
  8  |     
  9  |     // Verify dashboard text or element
> 10 |     await expect(page.locator('h1').first()).toContainText('Dashboard');
     |                                              ^ Error: expect(locator).toContainText(expected) failed
  11 |   });
  12 | });
  13 | 
```