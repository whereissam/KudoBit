import { test } from '@playwright/test';

test('Quick visual check of current state', async ({ page }) => {
  await page.goto('/');
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  // Take screenshot of current state
  await page.screenshot({ path: 'test-results/current-state.png', fullPage: true });
  
  // Check if KudoBit branding is visible
  const kudoBitElements = await page.locator('text=KudoBit').count();
  console.log(`Found ${kudoBitElements} KudoBit elements`);
  
  // Check if wrong network warning is still showing
  const wrongNetworkElements = await page.locator('text=Wrong network').count();
  console.log(`Found ${wrongNetworkElements} "Wrong network" warnings`);
  
  // Check if products section exists
  const noProductsMessage = await page.locator('text=No products yet').count();
  console.log(`Found ${noProductsMessage} "No products yet" messages`);
  
  console.log('✅ Screenshot saved to test-results/current-state.png');
});