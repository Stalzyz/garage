const { chromium } = require('@playwright/test');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:3001/dashboard/');
    await page.waitForSelector('input[type="email"]');
    
    await page.fill('input[type="email"]', 'admin@grekam.com');
    await page.fill('input[type="password"]', 'password123');
    
    await page.click('button:has-text("INITIALIZE")');
    
    // wait 3 seconds to see what happens
    await page.waitForTimeout(3000);
    
    // screenshot
    await page.screenshot({ path: '/Users/stalinkumar/.gemini/antigravity-ide/brain/dff55b2c-b01b-4e06-ac19-3188e093ebd7/login-debug.png' });
    
    const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 500));
    console.log("Current body text:");
    console.log(bodyText);
    console.log("Current URL:", page.url());

  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await browser.close();
  }
})();
