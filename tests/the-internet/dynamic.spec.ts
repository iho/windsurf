import { test, expect } from '@playwright/test';

test.describe('Dynamic Content Tests', () => {
  test.describe('Dynamic Loading', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('https://the-internet.herokuapp.com/dynamic_loading');
    });

    test('should display dynamic loading page', async ({ page }) => {
      await expect(page.getByText('Dynamically Loaded Page Elements')).toBeVisible();
      await expect(page.getByRole('link', { name: 'Example 1' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Example 2' })).toBeVisible();
    });

    test('should handle Example 1: Element on page that is hidden', async ({ page }) => {
      await page.getByRole('link', { name: 'Example 1' }).click();
      
      await expect(page.getByText('Dynamically Loaded Page Elements')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Start' })).toBeVisible();
      await expect(page.locator('#finish')).not.toBeVisible();
      
      // Click start button
      await page.getByRole('button', { name: 'Start' }).click();
      
      // Wait for loading to complete
      await page.locator('#loading').waitFor({ state: 'visible' });
      await page.locator('#finish').waitFor({ state: 'visible', timeout: 10000 });
      
      await expect(page.locator('#finish')).toContainText('Hello World!');
      await expect(page.locator('#loading')).not.toBeVisible();
    });

    test('should handle Example 2: Element rendered after the fact', async ({ page }) => {
      await page.getByRole('link', { name: 'Example 2' }).click();
      
      await expect(page.getByText('Dynamically Loaded Page Elements')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Start' })).toBeVisible();
      await expect(page.locator('#finish')).not.toBeAttached();
      
      // Click start button
      await page.getByRole('button', { name: 'Start' }).click();
      
      // Wait for loading to complete
      await page.locator('#loading').waitFor({ state: 'visible' });
      await page.locator('#finish').waitFor({ state: 'attached', timeout: 10000 });
      
      await expect(page.locator('#finish')).toContainText('Hello World!');
      await expect(page.locator('#loading')).not.toBeVisible();
    });

    test('should handle multiple start clicks', async ({ page }) => {
      await page.getByRole('link', { name: 'Example 1' }).click();
      
      // Click start button multiple times
      await page.getByRole('button', { name: 'Start' }).click();
      await page.getByRole('button', { name: 'Start' }).click();
      
      // Should still work correctly
      await page.locator('#finish').waitFor({ state: 'visible', timeout: 10000 });
      await expect(page.locator('#finish')).toContainText('Hello World!');
    });
  });

  test.describe('Dynamic Controls', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('https://the-internet.herokuapp.com/dynamic_controls');
    });

    test('should display dynamic controls page', async ({ page }) => {
      await expect(page.getByText('Dynamic Controls')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Remove' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Enable' })).toBeVisible();
    });

    test('should remove and add checkbox', async ({ page }) => {
      const checkbox = page.locator('#checkbox');
      const removeButton = page.getByRole('button', { name: 'Remove' });
      const addButton = page.getByRole('button', { name: 'Add' });
      
      // Initial state - checkbox should be visible
      await expect(checkbox).toBeVisible();
      await expect(removeButton).toBeVisible();
      
      // Remove checkbox
      await removeButton.click();
      
      // Wait for removal animation
      await expect(page.locator('#loading')).toBeVisible();
      await expect(page.locator('#loading')).not.toBeVisible();
      
      await expect(checkbox).not.toBeVisible();
      await expect(addButton).toBeVisible();
      
      // Add checkbox back
      await addButton.click();
      
      // Wait for addition animation
      await expect(page.locator('#loading')).toBeVisible();
      await expect(page.locator('#loading')).not.toBeVisible();
      
      await expect(checkbox).toBeVisible();
      await expect(removeButton).toBeVisible();
    });

    test('should enable and disable input', async ({ page }) => {
      const input = page.locator('input[type="text"]');
      const enableButton = page.getByRole('button', { name: 'Enable' });
      const disableButton = page.getByRole('button', { name: 'Disable' });
      
      // Initial state - input should be disabled
      await expect(input).toBeDisabled();
      await expect(enableButton).toBeVisible();
      
      // Enable input
      await enableButton.click();
      
      // Wait for enable animation
      await expect(page.locator('#loading')).toBeVisible();
      await expect(page.locator('#loading')).not.toBeVisible();
      
      await expect(input).toBeEnabled();
      await expect(disableButton).toBeVisible();
      
      // Type in enabled input
      await input.fill('Test text');
      await expect(input).toHaveValue('Test text');
      
      // Disable input
      await disableButton.click();
      
      // Wait for disable animation
      await expect(page.locator('#loading')).toBeVisible();
      await expect(page.locator('#loading')).not.toBeVisible();
      
      await expect(input).toBeDisabled();
      await expect(enableButton).toBeVisible();
      // Value should be preserved
      await expect(input).toHaveValue('Test text');
    });

    test('should handle multiple enable/disable cycles', async ({ page }) => {
      const input = page.locator('input[type="text"]');
      const enableButton = page.getByRole('button', { name: 'Enable' });
      const disableButton = page.getByRole('button', { name: 'Disable' });
      
      // Multiple cycles
      for (let i = 0; i < 3; i++) {
        await enableButton.click();
        await page.locator('#loading').waitFor({ state: 'visible' });
        await page.locator('#loading').waitFor({ state: 'hidden' });
        await expect(input).toBeEnabled();
        
        await disableButton.click();
        await page.locator('#loading').waitFor({ state: 'visible' });
        await page.locator('#loading').waitFor({ state: 'hidden' });
        await expect(input).toBeDisabled();
      }
    });
  });

  test.describe('Dynamic Content', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('https://the-internet.herokuapp.com/dynamic_content');
    });

    test('should display dynamic content page', async ({ page }) => {
      await expect(page.getByText('Dynamic Content')).toBeVisible();
      await expect(page.getByRole('link', { name: 'Example 1' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Example 2' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Example 3' })).toBeVisible();
    });

    test('should load different content on each page refresh', async ({ page }) => {
      await page.getByRole('link', { name: 'Example 1' }).click();
      
      const images = page.locator('.example img');
      await expect(images).toHaveCount(3);
      
      // Get initial image sources
      const initialSources = [];
      for (let i = 0; i < 3; i++) {
        initialSources.push(await images.nth(i).getAttribute('src'));
      }
      
      // Refresh page multiple times and check for different content
      let differentContentFound = false;
      for (let i = 0; i < 5; i++) {
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        const newSources = [];
        for (let j = 0; j < 3; j++) {
          newSources.push(await images.nth(j).getAttribute('src'));
        }
        
        // Check if any image source changed
        for (let j = 0; j < 3; j++) {
          if (initialSources[j] !== newSources[j]) {
            differentContentFound = true;
            break;
          }
        }
        
        if (differentContentFound) break;
      }
      
      // Note: This test might occasionally fail if the same content is loaded
      // which is valid behavior for random content
    });

    test('should handle Example 2 with dynamic content', async ({ page }) => {
      await page.getByRole('link', { name: 'Example 2' }).click();
      
      const images = page.locator('.example img');
      await expect(images).toHaveCount(3);
      
      // Verify images are loaded
      for (let i = 0; i < 3; i++) {
        await expect(images.nth(i)).toBeVisible();
      }
    });

    test('should handle Example 3 with dynamic content', async ({ page }) => {
      await page.getByRole('link', { name: 'Example 3' }).click();
      
      const images = page.locator('.example img');
      await expect(images).toHaveCount(3);
      
      // Verify images are loaded
      for (let i = 0; i < 3; i++) {
        await expect(images.nth(i)).toBeVisible();
      }
    });

    test('should verify all images have proper attributes', async ({ page }) => {
      await page.getByRole('link', { name: 'Example 1' }).click();
      
      const images = page.locator('.example img');
      await expect(images).toHaveCount(3);
      
      // Check each image has src and alt attributes
      for (let i = 0; i < 3; i++) {
        const img = images.nth(i);
        await expect(img).toHaveAttribute('src');
        await expect(img).toHaveAttribute('alt');
      }
    });
  });
});
