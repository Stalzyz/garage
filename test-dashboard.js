const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log("Navigating to http://localhost:3001/dashboard/ ...");
  const response = await page.goto('http://localhost:3001/dashboard/', { waitUntil: 'networkidle' });
  console.log("Status:", response.status());
  console.log("Final URL:", page.url());
  
  const title = await page.title();
  console.log("Page Title:", title);
  
  // Get text content of the page body
  const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 500));
  console.log("Body text snippet:");
  console.log(bodyText);
  
  await browser.close();
})();
