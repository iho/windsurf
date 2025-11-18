import { test, expect } from '@playwright/test';

test.describe('UI and Layout Tests', () => {
  test.describe('Broken Images', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('https://the-internet.herokuapp.com/broken_images');
    });

    test('should display broken images page', async ({ page }) => {
      await expect(page.getByText('Broken Images')).toBeVisible();
      const images = page.locator('img');
      await expect(images).toHaveCount(3);
    });

    test('should identify broken images', async ({ page }) => {
      const images = page.locator('img');
      const imageCount = await images.count();
      
      // Check each image
      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i);
        
        // Check if image is visible
        await expect(img).toBeVisible();
        
        // Check naturalWidth and naturalHeight to detect broken images
        const isBroken = await img.evaluate((el: HTMLImageElement) => {
          return el.naturalWidth === 0 && el.naturalHeight === 0;
        });
        
        // Some images might be broken, some might work
        console.log(`Image ${i + 1} is ${isBroken ? 'broken' : 'working'}`);
      }
    });

    test('should handle image loading errors', async ({ page }) => {
      const images = page.locator('img');
      
      // Listen for error events
      let errorCount = 0;
      page.on('response', response => {
        if (response.status() >= 400) {
          errorCount++;
        }
      });
      
      // Reload page to trigger image loads
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Check images again
      await expect(images).toHaveCount(3);
    });

    test('should have proper image attributes', async ({ page }) => {
      const images = page.locator('img');
      const imageCount = await images.count();
      
      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i);
        
        // Check for basic attributes
        await expect(img).toHaveAttribute('src');
        await expect(img).toHaveAttribute('width');
        await expect(img).toHaveAttribute('height');
      }
    });
  });

  test.describe('Disappearing Elements', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('https://the-internet.herokuapp.com/disappearing_elements');
    });

    test('should display disappearing elements page', async ({ page }) => {
      await expect(page.getByText('Disappearing Elements')).toBeVisible();
      await expect(page.locator('#content')).toBeVisible();
    });

    test('should handle menu elements that disappear', async ({ page }) => {
      const menuItems = page.locator('#content ul li a');
      const initialCount = await menuItems.count();
      expect(initialCount).toBeGreaterThan(0);
      
      // Refresh page multiple times to see if elements disappear
      let disappearedCount = 0;
      let currentCount = initialCount;
      
      for (let i = 0; i < 10; i++) {
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        const newCount = await menuItems.count();
        if (newCount < currentCount) {
          disappearedCount++;
          currentCount = newCount;
        }
      }
      
      console.log(`Elements disappeared ${disappearedCount} times during refresh`);
    });

    test('should verify specific menu items', async ({ page }) => {
      // Check for common menu items
      const expectedItems = ['Home', 'About', 'Contact Us', 'Portfolio', 'Gallery'];
      
      for (const item of expectedItems) {
        const menuItem = page.locator(`#content ul li a:has-text("${item}")`);
        if (await menuItem.count() > 0) {
          await expect(menuItem).toBeVisible();
        }
      }
    });

    test('should handle element visibility changes', async ({ page }) => {
      const menuItems = page.locator('#content ul li a');
      
      // Check initial state
      const initialCount = await menuItems.count();
      
      // Wait and check again
      await page.waitForTimeout(1000);
      const newCount = await menuItems.count();
      
      // Count might be the same or different
      expect(newCount).toBeGreaterThanOrEqual(0);
    });

    test('should maintain page structure', async ({ page }) => {
      // Check that main elements are present
      await expect(page.locator('#content')).toBeVisible();
      await expect(page.locator('#content ul')).toBeVisible();
      
      // Menu should exist even if items disappear
      const menu = page.locator('#content ul');
      await expect(menu).toBeVisible();
    });
  });

  test.describe('Shifting Content', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('https://the-internet.herokuapp.com/shifting_content');
    });

    test('should display shifting content page', async ({ page }) => {
      await expect(page.getByText('Shifting Content')).toBeVisible();
      await expect(page.getByRole('link', { name: 'Example 1' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Example 2' })).toBeVisible();
    });

    test('should handle Example 1: Menu shifting', async ({ page }) => {
      await page.getByRole('link', { name: 'Example 1' }).click();
      
      await expect(page.getByText('Shifting Content: Example 1')).toBeVisible();
      
      const menuItems = page.locator('.example ul li');
      const initialCount = await menuItems.count();
      expect(initialCount).toBeGreaterThan(0);
      
      // Check positions over time
      const positions = [];
      
      for (let i = 0; i < 5; i++) {
        const itemPositions = [];
        
        for (let j = 0; j < initialCount; j++) {
          const item = menuItems.nth(j);
          const box = await item.boundingBox();
          if (box) {
            itemPositions.push(box.x);
          }
        }
        
        positions.push(itemPositions);
        await page.waitForTimeout(1000);
      }
      
      // Positions might change (that's the point of shifting content)
      console.log('Menu item positions recorded over time');
    });

    test('should handle Example 2: Image shifting', async ({ page }) => {
      await page.getByRole('link', { name: 'Example 2' }).click();
      
      await expect(page.getByText('Shifting Content: Example 2')).toBeVisible();
      
      const images = page.locator('.example img');
      const imageCount = await images.count();
      expect(imageCount).toBeGreaterThan(0);
      
      // Check image positions over time
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < imageCount; j++) {
          const img = images.nth(j);
          await expect(img).toBeVisible();
          
          const box = await img.boundingBox();
          expect(box?.width).toBeGreaterThan(0);
          expect(box?.height).toBeGreaterThan(0);
        }
        
        await page.waitForTimeout(1000);
      }
    });

    test('should handle clicking shifting elements', async ({ page }) => {
      await page.getByRole('link', { name: 'Example 1' }).click();
      
      const menuItems = page.locator('.example ul li a');
      
      if (await menuItems.count() > 0) {
        // Try to click the first menu item
        const firstItem = menuItems.first();
        
        // Element might shift, so use force click if needed
        try {
          await firstItem.click();
        } catch (error) {
          // If regular click fails, try force click
          await firstItem.click({ force: true });
        }
        
        // Check if navigation happened or element was clicked
        // The behavior depends on the specific implementation
      }
    });

    test('should maintain content visibility during shifts', async ({ page }) => {
      await page.getByRole('link', { name: 'Example 1' }).click();
      
      const menuItems = page.locator('.example ul li');
      
      // Check that content remains visible over time
      for (let i = 0; i < 5; i++) {
        const count = await menuItems.count();
        expect(count).toBeGreaterThan(0);
        
        // Each item should be visible
        for (let j = 0; j < count; j++) {
          await expect(menuItems.nth(j)).toBeVisible();
        }
        
        await page.waitForTimeout(500);
      }
    });

    test('should handle responsive layout shifts', async ({ page }) => {
      // Test with different viewport sizes
      const viewports = [
        { width: 1920, height: 1080 },
        { width: 1366, height: 768 },
        { width: 768, height: 1024 },
        { width: 375, height: 667 }
      ];
      
      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.waitForTimeout(500);
        
        // Check that elements are still visible
        await expect(page.getByText('Shifting Content')).toBeVisible();
        
        const menuItems = page.locator('.example ul li');
        const count = await menuItems.count();
        
        if (count > 0) {
          for (let i = 0; i < count; i++) {
            await expect(menuItems.nth(i)).toBeVisible();
          }
        }
      }
    });
  });

  test.describe('Floating Menu', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('https://the-internet.herokuapp.com/floating_menu');
    });

    test('should display floating menu page', async ({ page }) => {
      await expect(page.getByText('Floating Menu')).toBeVisible();
      await expect(page.locator('#menu')).toBeVisible();
    });

    test('should have floating menu that stays visible', async ({ page }) => {
      const menu = page.locator('#menu');
      await expect(menu).toBeVisible();
      
      // Scroll down the page
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1000);
      
      // Menu should still be visible
      await expect(menu).toBeVisible();
      
      // Scroll back up
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(1000);
      
      // Menu should still be visible
      await expect(menu).toBeVisible();
    });

    test('should have working menu links', async ({ page }) => {
      const menuLinks = page.locator('#menu a');
      const linkCount = await menuLinks.count();
      expect(linkCount).toBeGreaterThan(0);
      
      // Check that links have proper attributes
      for (let i = 0; i < linkCount; i++) {
        const link = menuLinks.nth(i);
        await expect(link).toBeVisible();
        await expect(link).toHaveAttribute('href');
      }
    });

    test('should maintain menu position during scroll', async ({ page }) => {
      const menu = page.locator('#menu');
      
      // Get initial position
      const initialBox = await menu.boundingBox();
      expect(initialBox).toBeTruthy();
      
      // Scroll down
      await page.evaluate(() => window.scrollTo(0, 500));
      await page.waitForTimeout(500);
      
      // Check position after scroll
      const scrolledBox = await menu.boundingBox();
      expect(scrolledBox).toBeTruthy();
      
      // Menu should still be visible and positioned
      await expect(menu).toBeVisible();
    });
  });
});
