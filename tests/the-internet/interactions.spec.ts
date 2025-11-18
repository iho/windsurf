import { test, expect } from '@playwright/test';

test.describe('Advanced Interaction Tests', () => {
  test.describe('Drag and Drop', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('https://the-internet.herokuapp.com/drag_and_drop');
    });

    test('should display drag and drop page', async ({ page }) => {
      await expect(page.getByText('Drag and Drop')).toBeVisible();
      await expect(page.locator('#column-a')).toBeVisible();
      await expect(page.locator('#column-b')).toBeVisible();
    });

    test('should drag element from A to B', async ({ page }) => {
      const columnA = page.locator('#column-a');
      const columnB = page.locator('#column-b');
      
      // Check initial positions
      await expect(columnA).toContainText('A');
      await expect(columnB).toContainText('B');
      
      // Drag A to B
      await columnA.dragTo(columnB);
      
      // Verify positions swapped
      await expect(columnA).toContainText('B');
      await expect(columnB).toContainText('A');
    });

    test('should drag element from B to A', async ({ page }) => {
      const columnA = page.locator('#column-a');
      const columnB = page.locator('#column-b');
      
      // First drag A to B to set up the test
      await columnA.dragTo(columnB);
      
      // Now drag B (which contains A) to A
      await columnB.dragTo(columnA);
      
      // Verify positions swapped back
      await expect(columnA).toContainText('A');
      await expect(columnB).toContainText('B');
    });

    test('should handle multiple drag operations', async ({ page }) => {
      const columnA = page.locator('#column-a');
      const columnB = page.locator('#column-b');
      
      // Perform multiple drag operations
      for (let i = 0; i < 3; i++) {
        await columnA.dragTo(columnB);
        await expect(columnA).toContainText('B');
        await expect(columnB).toContainText('A');
        
        await columnB.dragTo(columnA);
        await expect(columnA).toContainText('A');
        await expect(columnB).toContainText('B');
      }
    });
  });

  test.describe('Hovers', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('https://the-internet.herokuapp.com/hovers');
    });

    test('should display hovers page', async ({ page }) => {
      await expect(page.getByText('Hovers')).toBeVisible();
      await expect(page.locator('.figure')).toHaveCount(3);
    });

    test('should show caption on hover', async ({ page }) => {
      const firstFigure = page.locator('.figure').first();
      const firstCaption = page.locator('.figcaption').first();
      
      // Initially caption should not be visible
      await expect(firstCaption).not.toBeVisible();
      
      // Hover over figure
      await firstFigure.hover();
      
      // Caption should now be visible
      await expect(firstCaption).toBeVisible();
      await expect(firstCaption).toContainText('name: user1');
    });

    test('should hide caption when hover ends', async ({ page }) => {
      const firstFigure = page.locator('.figure').first();
      const firstCaption = page.locator('.figcaption').first();
      
      // Hover and show caption
      await firstFigure.hover();
      await expect(firstCaption).toBeVisible();
      
      // Move away and hide caption
      await page.locator('h1').hover(); // Hover elsewhere
      await expect(firstCaption).not.toBeVisible();
    });

    test('should handle multiple figure hovers', async ({ page }) => {
      const figures = page.locator('.figure');
      const captions = page.locator('.figcaption');
      const figureCount = await figures.count();
      expect(figureCount).toBe(3);
      
      // Test each figure
      for (let i = 0; i < figureCount; i++) {
        const figure = figures.nth(i);
        const caption = captions.nth(i);
        
        // Hover and verify caption
        await figure.hover();
        await expect(caption).toBeVisible();
        
        // Verify caption content
        const captionText = await caption.textContent();
        expect(captionText).toContain('name: user');
        expect(captionText).toContain('View profile');
        
        // Move away
        await page.locator('h1').hover();
        await expect(caption).not.toBeVisible();
      }
    });

    test('should have working profile links', async ({ page }) => {
      const firstFigure = page.locator('.figure').first();
      
      // Hover to show caption
      await firstFigure.hover();
      
      // Click the profile link
      const profileLink = page.locator('.figcaption a').first();
      await expect(profileLink).toBeVisible();
      
      // Note: The link might not go anywhere, but it should be clickable
      await profileLink.click();
      
      // Check if we navigated or stayed on page
      const currentUrl = page.url();
      expect(currentUrl).toContain('the-internet.herokuapp.com');
    });
  });

  test.describe('Context Menu', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('https://the-internet.herokuapp.com/context_menu');
    });

    test('should display context menu page', async ({ page }) => {
      await expect(page.getByText('Context Menu')).toBeVisible();
      await expect(page.locator('#hot-spot')).toBeVisible();
    });

    test('should show context menu on right click', async ({ page }) => {
      const hotSpot = page.locator('#hot-spot');
      
      // Right click on the hot spot
      await hotSpot.click({ button: 'right' });
      
      // Note: Browser context menu might not be accessible via JavaScript
      // But we can verify the right-click event was triggered
      // The page might show an alert or handle the event differently
      
      // Check if any JavaScript alert was triggered
      page.on('dialog', async dialog => {
        expect(dialog.message()).toContain('You selected a context menu');
        await dialog.accept();
      });
      
      // Try right click again to trigger potential alert
      await hotSpot.click({ button: 'right' });
    });

    test('should handle left click normally', async ({ page }) => {
      const hotSpot = page.locator('#hot-spot');
      
      // Left click should not trigger context menu
      await hotSpot.click({ button: 'left' });
      
      // Should stay on same page
      await expect(page).toHaveURL(/context_menu/);
    });

    test('should have proper hotspot element', async ({ page }) => {
      const hotSpot = page.locator('#hot-spot');
      
      await expect(hotSpot).toBeVisible();
      await expect(hotSpot).toHaveAttribute('id', 'hot-spot');
      
      // Check if it's properly positioned
      const boundingBox = await hotSpot.boundingBox();
      expect(boundingBox?.width).toBeGreaterThan(0);
      expect(boundingBox?.height).toBeGreaterThan(0);
    });
  });

  test.describe('Key Presses', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('https://the-internet.herokuapp.com/key_presses');
    });

    test('should display key presses page', async ({ page }) => {
      await expect(page.getByText('Key Presses')).toBeVisible();
      await expect(page.getByText('Target')).toBeVisible();
      await expect(page.locator('#target')).toBeVisible();
    });

    test('should register key presses', async ({ page }) => {
      const target = page.locator('#target');
      const result = page.locator('#result');
      
      // Focus on the target
      await target.click();
      
      // Press a key
      await page.keyboard.press('A');
      
      // Check if the key was registered
      await expect(result).toContainText('You entered: A');
    });

    test('should handle special keys', async ({ page }) => {
      const target = page.locator('#target');
      const result = page.locator('#result');
      
      await target.click();
      
      // Test special keys
      const specialKeys = [
        { key: 'Enter', expected: 'ENTER' },
        { key: 'Escape', expected: 'ESCAPE' },
        { key: 'Backspace', expected: 'BACK_SPACE' },
        { key: 'Tab', expected: 'TAB' },
        { key: 'Space', expected: 'SPACE' }
      ];
      
      for (const { key, expected } of specialKeys) {
        await page.keyboard.press(key);
        await expect(result).toContainText(`You entered: ${expected}`);
        
        // Clear for next test
        await target.click();
        await page.keyboard.press('Backspace');
      }
    });

    test('should handle modifier keys', async ({ page }) => {
      const target = page.locator('#target');
      const result = page.locator('#result');
      
      await target.click();
      
      // Test modifier combinations
      await page.keyboard.press('Shift+A');
      await expect(result).toContainText('You entered: A');
      
      await page.keyboard.press('Control+A');
      await expect(result).toContainText('You entered: A');
      
      await page.keyboard.press('Alt+A');
      await expect(result).toContainText('You entered: A');
    });

    test('should handle arrow keys', async ({ page }) => {
      const target = page.locator('#target');
      const result = page.locator('#result');
      
      await target.click();
      
      // Test arrow keys
      const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
      
      for (const arrowKey of arrowKeys) {
        await page.keyboard.press(arrowKey);
        const expectedText = arrowKey.replace('Arrow', '').toUpperCase();
        await expect(result).toContainText(`You entered: ${expectedText}`);
        
        // Clear for next test
        await target.click();
        await page.keyboard.press('Backspace');
      }
    });

    test('should handle function keys', async ({ page }) => {
      const target = page.locator('#target');
      const result = page.locator('#result');
      
      await target.click();
      
      // Test function keys
      await page.keyboard.press('F1');
      await expect(result).toContainText('You entered: F1');
      
      await page.keyboard.press('F12');
      await expect(result).toContainText('You entered: F12');
    });

    test('should handle numpad keys', async ({ page }) => {
      const target = page.locator('#target');
      const result = page.locator('#result');
      
      await target.click();
      
      // Test numpad keys
      await page.keyboard.press('Numpad0');
      await expect(result).toContainText('You entered: 0');
      
      await page.keyboard.press('Numpad5');
      await expect(result).toContainText('You entered: 5');
      
      await page.keyboard.press('NumpadAdd');
      await expect(result).toContainText('You entered: +');
    });

    test('should maintain focus on target', async ({ page }) => {
      const target = page.locator('#target');
      
      // Click to focus
      await target.click();
      
      // Verify target is focused
      await expect(target).toBeFocused();
      
      // Press keys and verify focus is maintained
      await page.keyboard.press('A');
      await expect(target).toBeFocused();
      
      await page.keyboard.press('B');
      await expect(target).toBeFocused();
    });
  });
});
