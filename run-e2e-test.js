const { chromium } = require('@playwright/test');

(async () => {
  console.log("Launching headless browser...");
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // 1. Navigate to dashboard (which redirects to login)
    console.log("Navigating to http://localhost:3001/dashboard/ ...");
    await page.goto('http://localhost:3001/dashboard/');
    
    console.log("Waiting for login form...");
    await page.waitForSelector('input[type="email"]');
    
    // 2. Login
    console.log("Logging in with admin@grekam.com...");
    await page.fill('input[type="email"]', 'admin@grekam.com');
    await page.fill('input[type="password"]', 'password123');
    
    // Assuming the login button is text "INITIALIZE SESSION" based on the previous scrape
    await page.click('button:has-text("INITIALIZE")');
    
    // 3. Wait for dashboard redirect
    console.log("Waiting for dashboard redirect...");
    await page.waitForURL('**/dashboard**');
    console.log("Successfully logged in! Current URL:", page.url());
    
    // 4. Navigate to Course Builder
    console.log("Navigating to Course Builder...");
    await page.goto('http://localhost:3001/dashboard/studio/online/courses/builder');
    
    console.log("Waiting for Course Builder UI...");
    await page.waitForSelector('text=Create New Course');
    
    // 5. Fill out the New Course Form
    console.log("Filling out new course form...");
    
    // Use the actual labels or placeholders to find the inputs
    await page.fill('input[placeholder="e.g. Advanced Web Architecture"]', 'Playwright E2E Masterclass');
    await page.fill('input[placeholder="e.g. CS501"]', 'PW-101');
    
    console.log("Clicking Create Course...");
    await page.click('button:has-text("Create Course")');
    
    // 6. Wait for redirect to dynamic builder
    console.log("Waiting for redirect to dynamic builder [courseId]...");
    await page.waitForURL('**/builder/*');
    
    console.log("Successfully reached dynamic builder page! URL:", page.url());
    
    // Get the title to verify
    const title = await page.title();
    console.log("Final Page Title:", title);
    
    console.log("✅ E2E TEST PASSED SUCCESSFULLY!");
  } catch (error) {
    console.error("❌ E2E TEST FAILED:", error.message);
  } finally {
    await browser.close();
  }
})();
