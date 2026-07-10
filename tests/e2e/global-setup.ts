import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log(`Global Setup: Logging in via UI to ${baseURL}/auth/login ...`);
  await page.goto(`${baseURL}/auth/login`);
  
  await page.fill('input[type="email"]', 'superadmin@test.com');
  await page.fill('input[type="password"]', 'testpass');
  await page.click('button:has-text("INITIALIZE")');

  try {
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    await page.context().storageState({ path: 'playwright/.auth/user.json' });
    console.log('Global Setup: Authentication successful! Cookie saved.');
  } catch (e) {
    await page.screenshot({ path: 'playwright-report/login-fail.png' });
    console.error('Login timed out. Screenshot saved to playwright-report/login-fail.png');
    throw e;
  } finally {
    await browser.close();
  }
}
export default globalSetup;
