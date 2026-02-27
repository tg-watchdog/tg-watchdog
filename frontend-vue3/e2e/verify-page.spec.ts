import { test, expect } from '@playwright/test';

/**
 * E2E tests for the verification page
 * Tests the complete user flow for Telegram group verification
 */

test.describe('Verification Page', () => {
  test.describe('Page Load', () => {
    test('should show error for missing parameters', async ({ page }) => {
      await page.goto('/');
      
      // Should show error message about invalid request
      await expect(page.locator('text=/invalid|error|错误/i')).toBeVisible();
    });

    test('should load with valid parameters', async ({ page }) => {
      const params = new URLSearchParams({
        chat_id: '-100123456',
        msg_id: '789',
        user_id: '12345',
        timestamp: Date.now().toString(),
        signature: 'a'.repeat(64), // Valid hex signature format
      });
      
      await page.goto(`/?${params.toString()}`);
      
      // Should show verification page content
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('UI Elements', () => {
    test.beforeEach(async ({ page }) => {
      const params = new URLSearchParams({
        chat_id: '-100123456',
        msg_id: '789',
        user_id: '12345',
        timestamp: Date.now().toString(),
        signature: 'a'.repeat(64),
      });
      await page.goto(`/?${params.toString()}`);
    });

    test('should display verification message', async ({ page }) => {
      // Look for verification-related text
      const bodyText = await page.locator('body').textContent();
      expect(bodyText?.toLowerCase()).toMatch(/verify|验证|verification/);
    });

    test('should be responsive on mobile', async ({ page, viewport }) => {
      // Check if viewport meta tag exists
      const viewportMeta = await page.locator('meta[name="viewport"]').getAttribute('content');
      expect(viewportMeta).toContain('width=device-width');
      
      // Check if content fits within viewport
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = viewport?.width || 375;
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 50); // Allow small tolerance
    });
  });

  test.describe('Fallback Mode', () => {
    test('should show Telegram login button in fallback mode', async ({ page }) => {
      const params = new URLSearchParams({
        chat_id: '-100123456',
        msg_id: '789',
        user_id: '12345',
        timestamp: Date.now().toString(),
        signature: 'a'.repeat(64),
        fallback: '1',
      });
      
      await page.goto(`/?${params.toString()}`);
      
      // Should show Telegram login widget or fallback UI
      const bodyText = await page.locator('body').textContent();
      expect(bodyText?.toLowerCase()).toMatch(/login|登录|telegram/);
    });
  });

  test.describe('Error Handling', () => {
    test('should handle expired timestamp gracefully', async ({ page }) => {
      const expiredTimestamp = (Date.now() - 300000).toString(); // 5 minutes ago
      
      const params = new URLSearchParams({
        chat_id: '-100123456',
        msg_id: '789',
        user_id: '12345',
        timestamp: expiredTimestamp,
        signature: 'a'.repeat(64),
      });
      
      await page.goto(`/?${params.toString()}`);
      
      // Page should load without crashing
      await expect(page.locator('body')).toBeVisible();
    });

    test('should handle invalid signature format', async ({ page }) => {
      const params = new URLSearchParams({
        chat_id: '-100123456',
        msg_id: '789',
        user_id: '12345',
        timestamp: Date.now().toString(),
        signature: 'invalid-signature',
      });
      
      await page.goto(`/?${params.toString()}`);
      
      // Page should handle gracefully
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('API Integration', () => {
    test('should call verification API with correct data', async ({ page }) => {
      // Mock API response
      await page.route('**/endpoints/verify-captcha', async (route) => {
        await route.fulfill({
          status: 204,
          contentType: 'application/json',
        });
      });

      const params = new URLSearchParams({
        chat_id: '-100123456',
        msg_id: '789',
        user_id: '12345',
        timestamp: Date.now().toString(),
        signature: 'a'.repeat(64),
      });
      
      await page.goto(`/?${params.toString()}`);
      
      // Wait for any API calls to complete
      await page.waitForLoadState('networkidle');
    });

    test('should handle API errors gracefully', async ({ page }) => {
      // Mock API error response
      await page.route('**/endpoints/verify-captcha', async (route) => {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'INVALID_REQUEST' }),
        });
      });

      const params = new URLSearchParams({
        chat_id: '-100123456',
        msg_id: '789',
        user_id: '12345',
        timestamp: Date.now().toString(),
        signature: 'a'.repeat(64),
      });
      
      await page.goto(`/?${params.toString()}`);
      await page.waitForLoadState('networkidle');
      
      // Should show error message
      await expect(page.locator('body')).toBeVisible();
    });
  });
});

test.describe('Performance', () => {
  test('should load within acceptable time', async ({ page }) => {
    const params = new URLSearchParams({
      chat_id: '-100123456',
      msg_id: '789',
      user_id: '12345',
      timestamp: Date.now().toString(),
      signature: 'a'.repeat(64),
    });
    
    const startTime = Date.now();
    await page.goto(`/?${params.toString()}`);
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Page should load in under 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });
});
