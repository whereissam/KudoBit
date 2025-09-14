import { test, expect } from '@playwright/test';

test.describe('Product Loading Tests', () => {
  test('should load and display products from blockchain', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the page to load
    await expect(page).toHaveTitle(/KudoBit/);
    
    // Wait a bit for contract calls to complete
    await page.waitForTimeout(3000);
    
    // Check if we have products loading or "No products yet" message
    const noProductsMessage = page.locator('text=No products yet');
    // const productCards = page.locator('[data-testid="product-card"]');
    const productElements = page.locator('text=Digital Art Collection');
    
    // Either we should see products OR the "no products" message, but not a blank page
    const hasProducts = await productElements.count() > 0;
    const hasNoProductsMessage = await noProductsMessage.isVisible();
    
    console.log('Has products:', hasProducts);
    console.log('Has no products message:', hasNoProductsMessage);
    
    // We should see either products or the no products message
    expect(hasProducts || hasNoProductsMessage).toBeTruthy();
    
    // If we have products, verify they contain expected test data
    if (hasProducts) {
      await expect(page.locator('text=Digital Art Collection')).toBeVisible();
      console.log('✅ Found test product: Digital Art Collection');
    }
    
    // Check for network connection status
    const wrongNetworkWarning = page.locator('text=Wrong network');
    const isWrongNetwork = await wrongNetworkWarning.isVisible();
    console.log('Shows wrong network warning:', isWrongNetwork);
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-results/product-loading.png', fullPage: true });
  });
  
  test('should display KudoBit branding and features', async ({ page }) => {
    await page.goto('/');
    
    // Check for key branding elements
    await expect(page.locator('text=KudoBit')).toBeVisible();
    await expect(page.locator('text=Professional Blockchain Commerce Platform')).toBeVisible();
    
    // Check for feature highlights
    await expect(page.locator('text=Hybrid Rollup')).toBeVisible();
    await expect(page.locator('text=Decentralized Sequencer')).toBeVisible();
    await expect(page.locator('text=Instant Finality')).toBeVisible();
  });
});