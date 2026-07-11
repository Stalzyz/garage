# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: login2.spec.ts >> Login with admin backdoor
- Location: tests/e2e/login2.spec.ts:2:5

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /.*\/dashboard/
Received string:  "http://localhost:3000/auth/login"
Timeout: 15000ms

Call log:
  - Expect "toHaveURL" with timeout 15000ms
    23 × unexpected value "http://localhost:3000/auth/login"

```

```yaml
- heading "Grekam OS" [level=1]
- paragraph: Staff Secure Login
- text: System ID (Email)
- textbox "System ID (Email)":
  - /placeholder: staff@grekam.com
  - text: admin@grekam.com
- text: Passkey
- link "Recover?":
  - /url: /auth/forgot-password
- textbox "Passkey":
  - /placeholder: ••••••••
  - text: admin123
- button "Authenticating..." [disabled]
- link "Student or Educator? Log in here →":
  - /url: https://academy.grekam.in/auth/login
- link "← Return":
  - /url: /
- alert
```

# Test source

```ts
  1 | import { test, expect } from '@playwright/test';
  2 | test('Login with admin backdoor', async ({ page }) => {
  3 |   await page.goto('http://localhost:3000/auth/login');
  4 |   await page.fill('input[type="email"]', 'admin@grekam.com');
  5 |   await page.fill('input[type="password"]', 'admin123');
  6 |   await page.click('button[type="submit"]');
> 7 |   await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });
    |                      ^ Error: expect(page).toHaveURL(expected) failed
  8 | });
  9 | 
```