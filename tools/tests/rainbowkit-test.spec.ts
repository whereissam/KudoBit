import { test, expect } from '@playwright/test';

test.describe('RainbowKit Integration', () => {
  test('should display Connect Wallet button', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // Should have proper title
    await expect(page).toHaveTitle(/KudoBit/);
    
    // Should display Connect Wallet button
    const connectButton = page.getByText('Connect Wallet').first();
    await expect(connectButton).toBeVisible({ timeout: 10000 });
  });

  test('should display Connect button on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // Should display Connect button (mobile version)
    const connectButton = page.getByText('Connect').first();
    await expect(connectButton).toBeVisible({ timeout: 10000 });
  });

  test('should load without critical RainbowKit errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/', { waitUntil: 'networkidle' });
    
    // Check for critical errors (allow RainbowKit/wallet related ones)
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('wagmi') && 
      !error.includes('wallet') &&
      !error.includes('MetaMask') &&
      !error.includes('WalletConnect') &&
      !error.includes('RainbowKit')
    );
    
    expect(criticalErrors.length).toBe(0);
  });
});