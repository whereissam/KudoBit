import { test, expect } from '@playwright/test';

test.describe('Creator Dashboard UI', () => {
  test('should display wallet connection prompt when not connected', async ({ page }) => {
    await page.goto('/creator');
    
    // Should show connect wallet message
    await expect(page.getByRole('heading', { name: 'Connect Wallet' })).toBeVisible();
    await expect(page.getByText('Connect your wallet to access the creator dashboard')).toBeVisible();
  });

  test('should display homepage and navigation', async ({ page }) => {
    await page.goto('/');
    
    // Should have proper title
    await expect(page).toHaveTitle(/KudoBit/);
    
    // Should have navigation
    await expect(page.getByText('Morph Commerce')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Creator' })).toBeVisible();
  });

  test('should handle creator route navigation', async ({ page }) => {
    await page.goto('/creator');
    
    // Should be on creator page
    await expect(page).toHaveURL(/.*\/creator/);
    
    // Should show navigation container
    await expect(page.locator('nav')).toBeVisible();
  });

  test('should display responsive layout on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/creator');
    
    // Should still show connect wallet on mobile
    await expect(page.getByRole('heading', { name: 'Connect Wallet' })).toBeVisible();
    
    // Navigation should be responsive
    await expect(page.getByText('Morph')).toBeVisible(); // Mobile version
  });

  test('should have working navigation links', async ({ page }) => {
    await page.goto('/');
    
    // Find and click Creator link
    const creatorLink = page.getByRole('link', { name: 'Creator' });
    await expect(creatorLink).toBeVisible();
    await creatorLink.click();
    
    // Should navigate to creator page
    await expect(page).toHaveURL(/.*\/creator/);
  });

  test('should load page without critical JavaScript errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/creator');
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Check for critical errors (allow wagmi/wallet related ones)
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('wagmi') && 
      !error.includes('wallet') &&
      !error.includes('MetaMask') &&
      !error.includes('WalletConnect')
    );
    
    expect(criticalErrors.length).toBe(0);
  });
});

test.describe('Creator Dashboard Layout', () => {
  test('should have proper page structure', async ({ page }) => {
    await page.goto('/creator');
    
    // Check for navigation
    await expect(page.locator('nav')).toBeVisible();
    
    // Check for proper layout elements
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle route transitions', async ({ page }) => {
    // Start at homepage
    await page.goto('/');
    
    // Navigate to creator
    await page.goto('/creator');
    
    // Should successfully navigate
    await expect(page).toHaveURL(/.*\/creator/);
  });
});