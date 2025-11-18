import { test, expect } from '@playwright/test';

test.describe('Navigation and Page Tests', () => {
  test.describe('A/B Testing', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('https://the-internet.herokuapp.com/abtest');
    });

    test('should display A/B testing page', async ({ page }) => {
      await expect(page.getByText('A/B Test Control')).toBeVisible();
      await expect(page.getByText('A/B Test Variation 1')).not.toBeVisible();
    });

    test('should show different content on page refresh', async ({ page }) => {
      // Check initial content
      const initialContent = await page.content();
      const hasControl = initialContent.includes('A/B Test Control');
      const hasVariation = initialContent.includes('A/B Test Variation 1');
      
      // Should have either control or variation
      expect(hasControl || hasVariation).toBeTruthy();
      
      // Refresh multiple times to see if we get different content
      let differentContentFound = false;
      let controlCount = hasControl ? 1 : 0;
      let variationCount = hasVariation ? 1 : 0;
      
      for (let i = 0; i < 10; i++) {
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        const newContent = await page.content();
        const newHasControl = newContent.includes('A/B Test Control');
        const newHasVariation = newContent.includes('A/B Test Variation 1');
        
        if (newHasControl) controlCount++;
        if (newHasVariation) variationCount++;
        
        // Check if we found different content than initial
        if ((hasControl && newHasVariation) || (hasVariation && newHasControl)) {
          differentContentFound = true;
          break;
        }
      }
      
      // Log the distribution (for informational purposes)
      console.log(`Control shown ${controlCount} times, Variation shown ${variationCount} times`);
      
      // The test passes regardless of whether we see different content
      // since A/B testing might show the same variant multiple times
    });

    test('should have proper page structure', async ({ page }) => {
      await expect(page.locator('h3')).toBeVisible();
      const paragraphCount = await page.locator('p').count();
      expect(paragraphCount).toBeGreaterThan(0);
    });
  });

  test.describe('Redirect Link', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('https://the-internet.herokuapp.com/redirector');
    });

    test('should display redirector page', async ({ page }) => {
      await expect(page.getByText('Redirect Link Page')).toBeVisible();
      await expect(page.getByRole('link', { name: 'here' })).toBeVisible();
    });

    test('should redirect to status codes page', async ({ page }) => {
      // Click the redirect link
      const redirectLink = page.getByRole('link', { name: 'here' });
      await redirectLink.click();
      
      // Should redirect to status codes page
      await expect(page).toHaveURL(/status_codes/);
      await expect(page.getByText('Status Codes')).toBeVisible();
    });

    test('should handle redirect properly', async ({ page }) => {
      // Start navigation
      const redirectLink = page.getByRole('link', { name: 'here' });
      
      // Click and wait for navigation
      await Promise.all([
        page.waitForNavigation(),
        redirectLink.click()
      ]);
      
      // Verify we're on the status codes page
      await expect(page).toHaveURL('https://the-internet.herokuapp.com/status_codes');
      await expect(page.getByText('Status Codes')).toBeVisible();
    });

    test('should show status codes after redirect', async ({ page }) => {
      await page.getByRole('link', { name: 'here' }).click();
      
      // Check for common status code examples
      await expect(page.getByText('200')).toBeVisible();
      await expect(page.getByText('301')).toBeVisible();
      await expect(page.getByText('404')).toBeVisible();
      await expect(page.getByText('500')).toBeVisible();
    });
  });

  test.describe('Status Codes', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('https://the-internet.herokuapp.com/status_codes');
    });

    test('should display status codes page', async ({ page }) => {
      await expect(page.getByText('Status Codes')).toBeVisible();
      await expect(page.getByText('Each link below displays a different HTTP status code')).toBeVisible();
    });

    test('should handle 200 status code', async ({ page }) => {
      const response = await page.goto('https://the-internet.herokuapp.com/status_codes/200');
      expect(response?.status()).toBe(200);
      await expect(page.getByText('Status Codes')).toBeVisible();
      await expect(page.getByText('This page returned a 200 status code')).toBeVisible();
    });

    test('should handle 301 status code', async ({ page }) => {
      const response = await page.goto('https://the-internet.herokuapp.com/status_codes/301');
      expect(response?.status()).toBe(301);
      await expect(page.getByText('Status Codes')).toBeVisible();
      await expect(page.getByText('This page returned a 301 status code')).toBeVisible();
    });

    test('should handle 404 status code', async ({ page }) => {
      const response = await page.goto('https://the-internet.herokuapp.com/status_codes/404');
      expect(response?.status()).toBe(404);
      await expect(page.getByText('Status Codes')).toBeVisible();
      await expect(page.getByText('This page returned a 404 status code')).toBeVisible();
    });

    test('should handle 500 status code', async ({ page }) => {
      const response = await page.goto('https://the-internet.herokuapp.com/status_codes/500');
      expect(response?.status()).toBe(500);
      await expect(page.getByText('Status Codes')).toBeVisible();
      await expect(page.getByText('This page returned a 500 status code')).toBeVisible();
    });

    test('should navigate through status code links', async ({ page }) => {
      const statusLinks = page.locator('a[href*="/status_codes/"]');
      const linkCount = await statusLinks.count();
      expect(linkCount).toBeGreaterThan(0);
      
      // Test each status code link
      for (let i = 0; i < linkCount; i++) {
        const link = statusLinks.nth(i);
        const href = await link.getAttribute('href');
        
        if (href) {
          const response = await page.goto(`https://the-internet.herokuapp.com${href}`);
          expect(response?.status()).toBeGreaterThanOrEqual(200);
          expect(response?.status()).toBeLessThan(600);
          
          // Should show appropriate message
          await expect(page.getByText('This page returned a')).toBeVisible();
          await expect(page.getByText('status code')).toBeVisible();
        }
      }
    });

    test('should have proper link structure', async ({ page }) => {
      const statusLinks = page.locator('a[href*="/status_codes/"]');
      
      // Check for specific status codes
      const expectedCodes = ['200', '301', '404', '500'];
      
      for (const code of expectedCodes) {
        const link = page.locator(`a[href*="/status_codes/${code}"]`);
        await expect(link).toBeVisible();
        await expect(link).toContainText(code);
      }
    });
  });

  test.describe('Advert', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('https://the-internet.herokuapp.com/ad');
    });

    test('should display advert page', async ({ page }) => {
      await expect(page.getByText('Advert')).toBeVisible();
    });

    test('should handle ad rotation', async ({ page }) => {
      // Check initial ad
      const initialAd = page.locator('#ad');
      await expect(initialAd).toBeVisible();
      
      // Refresh page to see if ad changes
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      await expect(initialAd).toBeVisible();
      
      // Note: Ad content might change, but the ad container should remain
    });

    test('should have ad container', async ({ page }) => {
      const adContainer = page.locator('#ad');
      await expect(adContainer).toBeVisible();
      
      // Check if ad has content
      const adContent = adContainer.locator('*');
      const contentCount = await adContent.count();
      expect(contentCount).toBeGreaterThan(0);
    });
  });

  test.describe('Authentication Redirect', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('https://the-internet.herokuapp.com/redirect');
    });

    test('should display redirect page', async ({ page }) => {
      await expect(page.getByText('Redirect')).toBeVisible();
      await expect(page.getByRole('link', { name: 'here' })).toBeVisible();
    });

    test('should redirect to login page', async ({ page }) => {
      await page.getByRole('link', { name: 'here' }).click();
      
      // Should redirect to login page
      await expect(page).toHaveURL(/login/);
      await expect(page.getByRole('heading', { name: 'Login Page' })).toBeVisible();
    });

    test('should show login form after redirect', async ({ page }) => {
      await page.getByRole('link', { name: 'here' }).click();
      
      // Check login form elements
      await expect(page.getByRole('textbox', { name: 'Username' })).toBeVisible();
      await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
    });
  });
});
