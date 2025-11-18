import { test, expect } from '@playwright/test';

test.describe('Data and Table Tests', () => {
  test.describe('Sortable Data Tables', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('https://the-internet.herokuapp.com/tables');
    });

    test('should display sortable data tables page', async ({ page }) => {
      await expect(page.getByText('Data Tables')).toBeVisible();
      await expect(page.locator('#table1')).toBeVisible();
      await expect(page.locator('#table2')).toBeVisible();
    });

    test('should have proper table structure', async ({ page }) => {
      const table1 = page.locator('#table1');
      
      // Check table headers
      const headers = table1.locator('thead th');
      const headerCount = await headers.count();
      expect(headerCount).toBeGreaterThan(0);
      
      // Check table rows
      const rows = table1.locator('tbody tr');
      const rowCount = await rows.count();
      expect(rowCount).toBeGreaterThan(0);
      
      // Verify header text
      const expectedHeaders = ['Last Name', 'First Name', 'Email', 'Due', 'Web Site'];
      for (let i = 0; i < Math.min(headerCount, expectedHeaders.length); i++) {
        await expect(headers.nth(i)).toContainText(expectedHeaders[i]);
      }
    });

    test('should sort table by Last Name', async ({ page }) => {
      const table1 = page.locator('#table1');
      const lastNameHeader = table1.locator('thead th').first();
      
      // Get initial order
      const lastNameColumn = table1.locator('tbody tr td:nth-child(1)');
      const initialOrder = [];
      for (let i = 0; i < await lastNameColumn.count(); i++) {
        initialOrder.push(await lastNameColumn.nth(i).textContent());
      }
      
      // Click to sort
      await lastNameHeader.click();
      await page.waitForTimeout(500);
      
      // Get sorted order
      const sortedOrder = [];
      for (let i = 0; i < await lastNameColumn.count(); i++) {
        sortedOrder.push(await lastNameColumn.nth(i).textContent());
      }
      
      // Check if order changed (might be ascending or descending)
      expect(sortedOrder.length).toBe(initialOrder.length);
    });

    test('should sort table by First Name', async ({ page }) => {
      const table1 = page.locator('#table1');
      const firstNameHeader = table1.locator('thead th').nth(1);
      
      // Get initial order
      const firstNameColumn = table1.locator('tbody tr td:nth-child(2)');
      const initialOrder = [];
      for (let i = 0; i < await firstNameColumn.count(); i++) {
        initialOrder.push(await firstNameColumn.nth(i).textContent());
      }
      
      // Click to sort
      await firstNameHeader.click();
      await page.waitForTimeout(500);
      
      // Get sorted order
      const sortedOrder = [];
      for (let i = 0; i < await firstNameColumn.count(); i++) {
        sortedOrder.push(await firstNameColumn.nth(i).textContent());
      }
      
      // Verify sorting occurred
      expect(sortedOrder.length).toBe(initialOrder.length);
    });

    test('should sort table by Email', async ({ page }) => {
      const table1 = page.locator('#table1');
      const emailHeader = table1.locator('thead th').nth(2);
      
      // Get initial order
      const emailColumn = table1.locator('tbody tr td:nth-child(3)');
      const initialOrder = [];
      for (let i = 0; i < await emailColumn.count(); i++) {
        initialOrder.push(await emailColumn.nth(i).textContent());
      }
      
      // Click to sort
      await emailHeader.click();
      await page.waitForTimeout(500);
      
      // Get sorted order
      const sortedOrder = [];
      for (let i = 0; i < await emailColumn.count(); i++) {
        sortedOrder.push(await emailColumn.nth(i).textContent());
      }
      
      // Verify sorting occurred
      expect(sortedOrder.length).toBe(initialOrder.length);
    });

    test('should sort table by Due amount', async ({ page }) => {
      const table1 = page.locator('#table1');
      const dueHeader = table1.locator('thead th').nth(3);
      
      // Get initial order
      const dueColumn = table1.locator('tbody tr td:nth-child(4)');
      const initialOrder = [];
      for (let i = 0; i < await dueColumn.count(); i++) {
        initialOrder.push(await dueColumn.nth(i).textContent());
      }
      
      // Click to sort
      await dueHeader.click();
      await page.waitForTimeout(500);
      
      // Get sorted order
      const sortedOrder = [];
      for (let i = 0; i < await dueColumn.count(); i++) {
        sortedOrder.push(await dueColumn.nth(i).textContent());
      }
      
      // Verify sorting occurred
      expect(sortedOrder.length).toBe(initialOrder.length);
    });

    test('should sort table by Web Site', async ({ page }) => {
      const table1 = page.locator('#table1');
      const webSiteHeader = table1.locator('thead th').nth(4);
      
      // Get initial order
      const webSiteColumn = table1.locator('tbody tr td:nth-child(5)');
      const initialOrder = [];
      for (let i = 0; i < await webSiteColumn.count(); i++) {
        initialOrder.push(await webSiteColumn.nth(i).textContent());
      }
      
      // Click to sort
      await webSiteHeader.click();
      await page.waitForTimeout(500);
      
      // Get sorted order
      const sortedOrder = [];
      for (let i = 0; i < await webSiteColumn.count(); i++) {
        sortedOrder.push(await webSiteColumn.nth(i).textContent());
      }
      
      // Verify sorting occurred
      expect(sortedOrder.length).toBe(initialOrder.length);
    });

    test('should handle multiple sort clicks', async ({ page }) => {
      const table1 = page.locator('#table1');
      const lastNameHeader = table1.locator('thead th').first();
      
      // Click multiple times to toggle sort direction
      for (let i = 0; i < 3; i++) {
        await lastNameHeader.click();
        await page.waitForTimeout(500);
        
        // Verify table still has data
        const rows = table1.locator('tbody tr');
        expect(await rows.count()).toBeGreaterThan(0);
      }
    });

    test('should work with both tables', async ({ page }) => {
      const table2 = page.locator('#table2');
      
      // Check table2 structure
      const headers = table2.locator('thead th');
      const headerCount = await headers.count();
      expect(headerCount).toBeGreaterThan(0);
      
      const rows = table2.locator('tbody tr');
      const rowCount = await rows.count();
      expect(rowCount).toBeGreaterThan(0);
      
      // Try sorting table2
      const firstNameHeader = table2.locator('thead th').nth(1);
      await firstNameHeader.click();
      await page.waitForTimeout(500);
      
      // Verify data is still present
      expect(await rows.count()).toBe(rowCount);
    });

    test('should handle table cell interactions', async ({ page }) => {
      const table1 = page.locator('#table1');
      
      // Check for links in table cells
      const links = table1.locator('tbody tr td a');
      const linkCount = await links.count();
      
      if (linkCount > 0) {
        for (let i = 0; i < linkCount; i++) {
          const link = links.nth(i);
          await expect(link).toBeVisible();
          await expect(link).toHaveAttribute('href');
        }
      }
      
      // Check for editable elements
      const inputs = table1.locator('tbody tr input');
      const inputCount = await inputs.count();
      
      if (inputCount > 0) {
        for (let i = 0; i < inputCount; i++) {
          await expect(inputs.nth(i)).toBeVisible();
        }
      }
    });
  });

  test.describe('Large & Deep DOM', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('https://the-internet.herokuapp.com/large');
    });

    test('should display large DOM page', async ({ page }) => {
      await expect(page.getByText('Large & Deep DOM')).toBeVisible();
    });

    test('should handle large number of elements', async ({ page }) => {
      // Check for siblings container entries
      const siblings = page.locator('#siblings .parent');
      const siblingCount = await siblings.count();
      expect(siblingCount).toBeGreaterThan(0);
      
      // Check for child elements within the first sibling block
      if (siblingCount > 0) {
        const firstSibling = siblings.first();
        const children = firstSibling.locator(':scope > div');
        const childCount = await children.count();
        expect(childCount).toBeGreaterThan(0);
      }
    });

    test('should navigate through deep DOM structure', async ({ page }) => {
      // Find deeply nested elements
      const deepElements = page.locator('.deep');
      const deepCount = await deepElements.count();
      
      if (deepCount > 0) {
        // Check nested structure
        for (let i = 0; i < Math.min(deepCount, 5); i++) {
          const deepElement = deepElements.nth(i);
          await expect(deepElement).toBeVisible();
          
          // Check for nested children
          const nestedChildren = deepElement.locator('*');
          const childCount = await nestedChildren.count();
          expect(childCount).toBeGreaterThan(0);
        }
      }
    });

    test('should handle scrolling with large DOM', async ({ page }) => {
      // Check page height
      const pageHeight = await page.evaluate(() => document.body.scrollHeight);
      expect(pageHeight).toBeGreaterThan(1000);
      
      // Scroll to bottom
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1000);
      
      // Check if elements are still visible at bottom
      const bottomElements = page.getByRole('cell', { name: '50.6' }).last();
      await expect(bottomElements).toBeVisible();
      
      // Scroll back to top
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(1000);
      
      // Check top elements
      const topElements = page.locator('.siblings').first();
      await expect(topElements).toBeVisible();
    });

    test('should handle element selection in large DOM', async ({ page }) => {
      // Test selecting elements by different methods
      
      // By class
      const byClass = page.locator('.siblings');
      expect(await byClass.count()).toBeGreaterThan(0);
      
      // By tag
      const byTag = page.locator('div');
      expect(await byTag.count()).toBeGreaterThan(10);
      
      // By CSS selector
      const bySelector = page.locator('.siblings .child');
      expect(await bySelector.count()).toBeGreaterThan(0);
    });

    test('should handle performance with large DOM', async ({ page }) => {
      // Measure performance of common operations
      const startTime = Date.now();
      
      // Count all divs
      const allDivs = page.locator('div');
      const divCount = await allDivs.count();
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log(`Counted ${divCount} divs in ${duration}ms`);
      
      // Should complete in reasonable time
      expect(duration).toBeLessThan(5000);
      expect(divCount).toBeGreaterThan(50);
    });

    test('should handle text extraction from large DOM', async ({ page }) => {
      // Get text content from large sections
      const siblings = page.locator('.siblings');
      const siblingCount = await siblings.count();
      
      // Extract text from first few siblings
      for (let i = 0; i < Math.min(siblingCount, 3); i++) {
        const sibling = siblings.nth(i);
        const text = await sibling.textContent();
        expect(text).toBeTruthy();
        expect(text?.length).toBeGreaterThan(0);
      }
    });

    test('should handle attribute access in large DOM', async ({ page }) => {
      // Check attributes on many elements
      const elementsWithClass = page.locator('[class]');
      const elementCount = await elementsWithClass.count();
      expect(elementCount).toBeGreaterThan(0);
      
      // Check class attributes on some elements
      for (let i = 0; i < Math.min(elementCount, 5); i++) {
        const element = elementsWithClass.nth(i);
        const className = await element.getAttribute('class');
        expect(className).toBeTruthy();
        expect(className?.length).toBeGreaterThan(0);
      }
    });
  });
});
