import { test, expect } from '@playwright/test';

test.describe('Frame and Window Tests', () => {
  test.describe('Frames', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('https://the-internet.herokuapp.com/frames');
    });

    test('should display frames page', async ({ page }) => {
      await expect(page.getByText('Frames')).toBeVisible();
      await expect(page.getByRole('link', { name: 'iFrame' })).toBeVisible();
    });

    test('should navigate to iframe page', async ({ page }) => {
      await page.getByRole('link', { name: 'iFrame' }).click();
      
      await expect(page).toHaveURL(/iframe/);
      await expect(page.getByText('An iFrame containing the TinyMCE WYSIWYG Editor')).toBeVisible();
    });

    test('should handle iframe content', async ({ page }) => {
      await page.goto('https://the-internet.herokuapp.com/iframe');
      
      // Get the iframe
      const frame = page.frameLocator('#mce_0_ifr');
      
      // Switch to iframe and interact with content
      await expect(frame.locator('#tinymce')).toBeVisible();
      
      // Get initial content
      const initialContent = await frame.locator('#tinymce p').textContent();
      expect(initialContent).toContain('Your content goes here.');
      
      // Clear and type new content
      await frame.locator('#tinymce').click();
      await frame.locator('#tinymce p').fill('Hello from Playwright!');
      
      // Verify new content
      const newContent = await frame.locator('#tinymce p').textContent();
      expect(newContent).toBe('Hello from Playwright!');
    });

    test('should handle iframe formatting', async ({ page }) => {
      await page.goto('https://the-internet.herokuapp.com/iframe');
      
      const frame = page.frameLocator('#mce_0_ifr');
      
      // Click in the editor
      await frame.locator('#tinymce').click();
      
      // Try to format text (if toolbar is accessible)
      // Note: The TinyMCE toolbar might be outside the iframe
      const toolbar = page.locator('.mce-toolbar');
      if (await toolbar.count() > 0) {
        await expect(toolbar).toBeVisible();
      }
    });

    test('should handle iframe focus', async ({ page }) => {
      await page.goto('https://the-internet.herokuapp.com/iframe');
      
      const frame = page.frameLocator('#mce_0_ifr');
      
      // Click in iframe and verify focus
      await frame.locator('#tinymce').click();
      await expect(frame.locator('#tinymce')).toBeFocused();
      
      // Type text
      await frame.locator('#tinymce p').fill('Test focus');
      
      // Verify content was typed
      await expect(frame.locator('#tinymce p')).toContainText('Test focus');
    });
  });

  test.describe('Nested Frames', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('https://the-internet.herokuapp.com/nested_frames');
    });

    test('should display nested frames page', async ({ page }) => {
      await expect(page.getByText('Nested Frames')).toBeVisible();
    });

    test('should handle frame hierarchy', async ({ page }) => {
      // Check for frames
      const frames = page.frames();
      expect(frames.length).toBeGreaterThan(1);
    });

    test('should interact with top frame', async ({ page }) => {
      // Get the top frame
      const topFrame = page.frameLocator('frame[name="frame-top"]');
      
      // Check for content in top frame
      const topContent = topFrame.locator('body');
      await expect(topContent).toBeVisible();
    });

    test('should interact with left frame', async ({ page }) => {
      // Navigate to left frame through the hierarchy
      const topFrame = page.frameLocator('frame[name="frame-top"]');
      const leftFrame = topFrame.frameLocator('frame[name="frame-left"]');
      
      // Check for LEFT content
      await expect(leftFrame.locator('body')).toContainText('LEFT');
    });

    test('should interact with middle frame', async ({ page }) => {
      // Navigate to middle frame through the hierarchy
      const topFrame = page.frameLocator('frame[name="frame-top"]');
      const middleFrame = topFrame.frameLocator('frame[name="frame-middle"]');
      
      // Check for MIDDLE content
      await expect(middleFrame.locator('body')).toContainText('MIDDLE');
    });

    test('should interact with right frame', async ({ page }) => {
      // Navigate to right frame through the hierarchy
      const topFrame = page.frameLocator('frame[name="frame-top"]');
      const rightFrame = topFrame.frameLocator('frame[name="frame-right"]');
      
      // Check for RIGHT content
      await expect(rightFrame.locator('body')).toContainText('RIGHT');
    });

    test('should interact with bottom frame', async ({ page }) => {
      // Get the bottom frame
      const bottomFrame = page.frameLocator('frame[name="frame-bottom"]');
      
      // Check for BOTTOM content
      await expect(bottomFrame.locator('body')).toContainText('BOTTOM');
    });

    test('should verify all frames are present', async ({ page }) => {
      // Check all frame elements exist
      await expect(page.locator('frame[name="frame-top"]')).toBeVisible();
      await expect(page.locator('frame[name="frame-bottom"]')).toBeVisible();
      
      // Check nested frames
      const topFrame = page.frameLocator('frame[name="frame-top"]');
      await expect(topFrame.locator('frame[name="frame-left"]')).toBeVisible();
      await expect(topFrame.locator('frame[name="frame-middle"]')).toBeVisible();
      await expect(topFrame.locator('frame[name="frame-right"]')).toBeVisible();
    });
  });

  test.describe('Multiple Windows', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('https://the-internet.herokuapp.com/windows');
    });

    test('should display windows page', async ({ page }) => {
      await expect(page.getByText('Opening a new window')).toBeVisible();
      await expect(page.getByRole('link', { name: 'Click Here' })).toBeVisible();
    });

    test('should open new window', async ({ page }) => {
      // Start waiting for new page
      const newPagePromise = page.context().waitForEvent('page');
      
      // Click link to open new window
      await page.getByRole('link', { name: 'Click Here' }).click();
      
      // Wait for new page to open
      const newPage = await newPagePromise;
      
      // Verify new page content
      await expect(newPage.getByText('New Window')).toBeVisible();
      await expect(newPage.locator('h3')).toContainText('New Window');
      
      // Verify URL
      await expect(newPage).toHaveURL(/windows\/new/);
      
      // Close new page
      await newPage.close();
    });

    test('should handle multiple windows', async ({ page }) => {
      const newPages = [];
      
      // Open multiple windows
      for (let i = 0; i < 3; i++) {
        const newPagePromise = page.context().waitForEvent('page');
        await page.getByRole('link', { name: 'Click Here' }).click();
        const newPage = await newPagePromise;
        newPages.push(newPage);
      }
      
      // Verify all new pages
      for (const newPage of newPages) {
        await expect(newPage.getByText('New Window')).toBeVisible();
      }
      
      // Close all new pages
      for (const newPage of newPages) {
        await newPage.close();
      }
    });

    test('should maintain original page focus', async ({ page }) => {
      // Store original page URL
      const originalUrl = page.url();
      
      // Open new window
      const newPagePromise = page.context().waitForEvent('page');
      await page.getByRole('link', { name: 'Click Here' }).click();
      const newPage = await newPagePromise;
      
      // Original page should still be accessible
      await expect(page).toHaveURL(originalUrl);
      await expect(page.getByRole('link', { name: 'Click Here' })).toBeVisible();
      
      // Close new page
      await newPage.close();
    });

    test('should switch between windows', async ({ page }) => {
      // Open new window
      const newPagePromise = page.context().waitForEvent('page');
      await page.getByRole('link', { name: 'Click Here' }).click();
      const newPage = await newPagePromise;
      
      // Switch back to original page
      await page.bringToFront();
      await expect(page.getByRole('link', { name: 'Click Here' })).toBeVisible();
      
      // Switch to new page
      await newPage.bringToFront();
      await expect(newPage.getByText('New Window')).toBeVisible();
      
      // Close new page
      await newPage.close();
    });

    test('should handle window content interaction', async ({ page }) => {
      // Open new window
      const newPagePromise = page.context().waitForEvent('page');
      await page.getByRole('link', { name: 'Click Here' }).click();
      const newPage = await newPagePromise;
      
      // Interact with new window content
      await expect(newPage.locator('div.example')).toBeVisible();
      await expect(newPage.locator('h3')).toHaveText('New Window');
      
      // Check if there are any interactive elements
      const links = newPage.locator('a');
      if (await links.count() > 0) {
        await expect(links.first()).toBeVisible();
      }
      
      // Close new page
      await newPage.close();
    });
  });
});
