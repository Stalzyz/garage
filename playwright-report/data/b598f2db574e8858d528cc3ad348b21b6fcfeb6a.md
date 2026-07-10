# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: login.spec.ts >> Login with real credentials
- Location: tests/e2e/login.spec.ts:2:5

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /.*\/dashboard/
Received string:  "http://localhost:3000/auth/login"
Timeout: 15000ms

Call log:
  - Expect "toHaveURL" with timeout 15000ms
    30 × unexpected value "http://localhost:3000/auth/login"

```

```yaml
- alert
- img "Grekam"
- text: Grekam
- button
- text: 00:00:00
- button
- button "Notifications"
- text: Live SUPER_ADMIN CLEARANCE
- link "Dashboard":
  - /url: /dashboard
- link "My Workspace (ESS)":
  - /url: /dashboard/ess
- button "CRM & Sales"
- link "Lead Pipeline":
  - /url: /dashboard/crm
- link "Contacts":
  - /url: /dashboard/crm/contacts
- link "Proposals":
  - /url: /dashboard/crm/proposals
- link "Power Dialer":
  - /url: /dashboard/crm/dialer
- link "Call Intel":
  - /url: /dashboard/crm/calls
- link "Products":
  - /url: /dashboard/products
- link "Subscriptions":
  - /url: /dashboard/subscriptions
- button "Projects"
- link "Kanban Board":
  - /url: /dashboard/projects
- link "Asset Hub":
  - /url: /dashboard/projects/assets
- button "Finance"
- link "Overview":
  - /url: /dashboard/finance
- link "Revenue":
  - /url: /dashboard/finance/revenue
- link "P&L":
  - /url: /dashboard/finance/pnl
- link "Estimates":
  - /url: /dashboard/finance/estimates
- link "Taxes":
  - /url: /dashboard/finance/taxes
- button "HR & Identity"
- link "Employees":
  - /url: /dashboard/hr
- link "Time Track":
  - /url: /dashboard/hr/time
- link "Attendance":
  - /url: /dashboard/hr/attendance
- link "Leaves":
  - /url: /dashboard/hr/leaves
- link "Payroll":
  - /url: /dashboard/hr/payroll
- link "Documents":
  - /url: /dashboard/hr/documents
- link "Onboarding":
  - /url: /dashboard/hr/onboarding
- link "ATS":
  - /url: /dashboard/hr/ats
- link "Expenses":
  - /url: /dashboard/hr/expenses
- link "Monitoring":
  - /url: /dashboard/hr/monitoring
- link "Performance":
  - /url: /dashboard/hr/performance
- link "Analytics":
  - /url: /dashboard/hr/analytics
- link "Vendors":
  - /url: /dashboard/vendors
- button "Marketing"
- link "AI Prospects":
  - /url: /dashboard/marketing/prospects
- link "Content Scheduler":
  - /url: /dashboard/marketing/scheduler
- link "Email Campaigns":
  - /url: /dashboard/marketing/email
- link "Ad Campaigns":
  - /url: /dashboard/marketing/campaigns
- button "CMS & Website"
- link "Pages Builder":
  - /url: /dashboard/cms
- link "Blog Posts":
  - /url: /dashboard/cms/blog
- link "Media Library":
  - /url: /dashboard/cms/media
- link "SEO Settings":
  - /url: /dashboard/cms/seo
- link "Analytics":
  - /url: /dashboard/analytics
- link "Support":
  - /url: /dashboard/support
- link "Automations":
  - /url: /dashboard/automations
- link "Chat Hub":
  - /url: /dashboard/chat
- link "Asset Drive":
  - /url: /dashboard/drive
- link "Notifications":
  - /url: /dashboard/notifications
- link "Knowledge Base":
  - /url: /dashboard/kb
- button "Settings"
- link "General":
  - /url: /dashboard/settings
- link "Roles & Permissions":
  - /url: /dashboard/settings/roles
- link "Finance & Currency":
  - /url: /dashboard/settings/finance
- link "Integrations":
  - /url: /dashboard/settings/integrations
- text: S Stalin Kumar admin@grekam.in
- main:
  - heading "Welcome back, Stalin Kumar" [level=1]
  - paragraph: Here is your system overview for today.
  - heading "Total Revenue" [level=3]
  - text: $579,300 Live Data
  - heading "Active Students" [level=3]
  - text: 1 Live Data
  - heading "Open Projects" [level=3]
  - text: 2 Live Data
  - heading "Support Tickets" [level=3]
  - text: 1 Live Data
  - heading "Revenue Growth" [level=2]
  - text: $50k $25k $0 $0 $0 $0 $0 $0 $0 $147,500 $0 Dec Jan Feb Mar Apr May Jun Jul
  - heading "Recent Activity" [level=2]
  - heading "New Proposal Accepted" [level=4]
  - paragraph: Stark Industries approved 'Brand Redesign'
  - text: 2 hours ago
  - heading "Support Ticket Opened" [level=4]
  - paragraph: Login issue reported by student
  - text: 4 hours ago
  - heading "Payroll Processed" [level=4]
  - paragraph: June 2026 salaries dispatched
  - text: 1 day ago
  - heading "New Course Module" [level=4]
  - paragraph: "'Advanced React' published to LMS"
  - text: 2 days ago
- button
```

# Test source

```ts
  1 | import { test, expect } from '@playwright/test';
  2 | test('Login with real credentials', async ({ page }) => {
  3 |   await page.goto('http://localhost:3000/auth/login');
  4 |   await page.fill('input[type="email"]', 'admin@grekam.in');
  5 |   await page.fill('input[type="password"]', 'Medusa09@');
  6 |   await page.click('button[type="submit"]');
> 7 |   await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });
    |                      ^ Error: expect(page).toHaveURL(expected) failed
  8 | });
  9 | 
```