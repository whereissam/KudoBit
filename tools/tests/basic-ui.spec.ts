import { test, expect } from '@playwright/test';

test.describe('Basic UI Tests', () => {
  test('should display correct branding and basic elements', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check for KudoBit branding (updated from Morph Commerce)
    await expect(page.locator('text=KudoBit')).toBeVisible();
    
    // Check for key feature highlights
    await expect(page.locator('text=Hybrid Rollup')).toBeVisible();
    await expect(page.locator('text=Decentralized Sequencer')).toBeVisible();
    await expect(page.locator('text=Instant Finality')).toBeVisible();
    
    // Check for connect wallet button
    await expect(page.locator('text=Connect Wallet')).toBeVisible();
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'test-results/basic-ui.png', fullPage: true });
    
    console.log('✅ Basic UI elements are loading correctly');
  });
  
  test('should navigate to creator page', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page load
    await page.waitForLoadState('networkidle');
    
    // Click on Creator link
    await page.click('text=Creator');
    
    // Verify we're on creator page
    await expect(page).toHaveURL(/.*\/creator/);
    
    // Should see creator-specific content
    await page.waitForLoadState('networkidle');
    
    console.log('✅ Navigation to creator page works');
  });
});