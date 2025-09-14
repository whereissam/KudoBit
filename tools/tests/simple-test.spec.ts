import { test, expect } from '@playwright/test';

test.describe('Simple App Tests', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    
    // Should have proper title
    await expect(page).toHaveTitle(/KudoBit/);
    
    // Should render something
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load creator page', async ({ page }) => {
    await page.goto('/creator');
    
    // Should be on creator page
    await expect(page).toHaveURL(/.*\/creator/);
    
    // Should render something
    await expect(page.locator('body')).toBeVisible();
  });
});