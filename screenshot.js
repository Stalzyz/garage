const { chromium } = require('@playwright/test');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3001/dashboard/studio/online/courses/builder');
  await page.waitForTimeout(3000);
  const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 500));
  console.log("Current URL:", page.url());
  console.log("Current body text:", bodyText);
  await browser.close();
})();
