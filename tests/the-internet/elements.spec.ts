import { test, expect } from '@playwright/test';

test.describe('Element Interaction Tests', () => {
  test.describe('Add/Remove Elements', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('https://the-internet.herokuapp.com/add_remove_elements/');
    });

    test('should display add/remove elements page', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Add/Remove Elements' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Add Element' })).toBeVisible();
    });

    test('should add elements when button is clicked', async ({ page }) => {
      await page.getByRole('button', { name: 'Add Element' }).click();
      await expect(page.getByRole('button', { name: 'Delete' })).toBeVisible();
      
      await page.getByRole('button', { name: 'Add Element' }).click();
      await expect(page.getByRole('button', { name: 'Delete' })).toHaveCount(2);
      
      await page.getByRole('button', { name: 'Add Element' }).click();
      await expect(page.getByRole('button', { name: 'Delete' })).toHaveCount(3);
    });

    test('should remove elements when delete button is clicked', async ({ page }) => {
      // Add multiple elements
      await page.getByRole('button', { name: 'Add Element' }).click();
      await page.getByRole('button', { name: 'Add Element' }).click();
      await page.getByRole('button', { name: 'Add Element' }).click();
      
      await expect(page.getByRole('button', { name: 'Delete' })).toHaveCount(3);
      
      // Remove elements one by one
      await page.getByRole('button', { name: 'Delete' }).first().click();
      await expect(page.getByRole('button', { name: 'Delete' })).toHaveCount(2);
      
      await page.getByRole('button', { name: 'Delete' }).first().click();
      await expect(page.getByRole('button', { name: 'Delete' })).toHaveCount(1);
      
      await page.getByRole('button', { name: 'Delete' }).first().click();
      await expect(page.getByRole('button', { name: 'Delete' })).toHaveCount(0);
    });

    test('should remove specific element', async ({ page }) => {
      await page.getByRole('button', { name: 'Add Element' }).click();
      await page.getByRole('button', { name: 'Add Element' }).click();
      
      const deleteButtons = page.getByRole('button', { name: 'Delete' });
      await expect(deleteButtons).toHaveCount(2);
      
      // Remove the second element
      await deleteButtons.nth(1).click();
      await expect(deleteButtons).toHaveCount(1);
    });
  });

  test.describe('Checkboxes', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('https://the-internet.herokuapp.com/checkboxes');
    });

    test('should display checkboxes page', async ({ page }) => {
      await expect(page.getByText('Checkboxes')).toBeVisible();
      const checkboxes = page.locator('input[type="checkbox"]');
      await expect(checkboxes).toHaveCount(2);
    });

    test('should check and uncheck checkboxes', async ({ page }) => {
      const checkboxes = page.locator('input[type="checkbox"]');
      
      // Check initial state
      await expect(checkboxes.first()).not.toBeChecked();
      await expect(checkboxes.nth(1)).toBeChecked();
      
      // Check the first checkbox
      await checkboxes.first().check();
      await expect(checkboxes.first()).toBeChecked();
      
      // Uncheck the second checkbox
      await checkboxes.nth(1).uncheck();
      await expect(checkboxes.nth(1)).not.toBeChecked();
      
      // Toggle both
      await checkboxes.first().click();
      await checkboxes.nth(1).click();
      
      await expect(checkboxes.first()).not.toBeChecked();
      await expect(checkboxes.nth(1)).toBeChecked();
    });

    test('should handle multiple checkbox interactions', async ({ page }) => {
      const checkboxes = page.locator('input[type="checkbox"]');
      
      // Check both checkboxes
      await checkboxes.first().check();
      await expect(checkboxes).toHaveValues(['on', 'on']);
      
      // Uncheck both
      await checkboxes.first().uncheck();
      await checkboxes.nth(1).uncheck();
      await expect(checkboxes.first()).not.toBeChecked();
      await expect(checkboxes.nth(1)).not.toBeChecked();
    });
  });

  test.describe('Dropdown', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('https://the-internet.herokuapp.com/dropdown');
    });

    test('should display dropdown page', async ({ page }) => {
      await expect(page.getByText('Dropdown List')).toBeVisible();
      await expect(page.locator('select#dropdown')).toBeVisible();
    });

    test('should select dropdown options', async ({ page }) => {
      const dropdown = page.locator('select#dropdown');
      
      // Check initial state
      await expect(dropdown).toHaveValue('');
      
      // Select Option 1
      await dropdown.selectOption('1');
      await expect(dropdown).toHaveValue('1');
      
      // Select Option 2
      await dropdown.selectOption('2');
      await expect(dropdown).toHaveValue('2');
    });

    test('should handle disabled option', async ({ page }) => {
      const dropdown = page.locator('select#dropdown');
      
      // Try to select the disabled option
      await expect(dropdown.locator('option[value=""]')).toBeDisabled();
      
      // Select a valid option
      await dropdown.selectOption('1');
      await expect(dropdown).toHaveValue('1');
      
      // Verify disabled option cannot be selected
      await dropdown.selectOption('');
      await expect(dropdown).toHaveValue('1');
    });

    test('should get selected option text', async ({ page }) => {
      const dropdown = page.locator('select#dropdown');
      
      await dropdown.selectOption('1');
      const selectedOption = dropdown.locator('option:checked');
      await expect(selectedOption).toHaveText('Option 1');
      
      await dropdown.selectOption('2');
      await expect(selectedOption).toHaveText('Option 2');
    });
  });

  test.describe('Inputs', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('https://the-internet.herokuapp.com/inputs');
    });

    test('should display inputs page', async ({ page }) => {
      await expect(page.getByText('Inputs')).toBeVisible();
      await expect(page.locator('input[type="number"]')).toBeVisible();
    });

    test('should accept numeric input', async ({ page }) => {
      const input = page.locator('input[type="number"]');
      
      await input.fill('123');
      await expect(input).toHaveValue('123');
      
      await input.fill('456.789');
      await expect(input).toHaveValue('456.789');
      
      await input.fill('0');
      await expect(input).toHaveValue('0');
    });

    test('should handle arrow keys for increment/decrement', async ({ page }) => {
      const input = page.locator('input[type="number"]');
      
      await input.fill('100');
      await expect(input).toHaveValue('100');
      
      // Press up arrow to increment
      await input.press('ArrowUp');
      await expect(input).toHaveValue('101');
      
      // Press down arrow to decrement
      await input.press('ArrowDown');
      await expect(input).toHaveValue('100');
      
      // Multiple presses
      await input.press('ArrowUp');
      await input.press('ArrowUp');
      await input.press('ArrowUp');
      await expect(input).toHaveValue('103');
    });

    test('should handle non-numeric input', async ({ page }) => {
      const input = page.locator('input[type="number"]');
      
      await input.fill('abc');
      await expect(input).toHaveValue('');
      
      await input.fill('123abc');
      await expect(input).toHaveValue('123');
      
      await input.fill('abc123');
      await expect(input).toHaveValue('');
    });

    test('should handle negative numbers', async ({ page }) => {
      const input = page.locator('input[type="number"]');
      
      await input.fill('-50');
      await expect(input).toHaveValue('-50');
      
      await input.press('ArrowUp');
      await expect(input).toHaveValue('-49');
      
      await input.press('ArrowUp');
      await expect(input).toHaveValue('-48');
    });

    test('should handle decimal numbers with arrows', async ({ page }) => {
      const input = page.locator('input[type="number"]');
      
      await input.fill('10.5');
      await expect(input).toHaveValue('10.5');
      
      await input.press('ArrowUp');
      await expect(input).toHaveValue('11.5');
      
      await input.press('ArrowDown');
      await expect(input).toHaveValue('10.5');
    });
  });

  test.describe('Horizontal Slider', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('https://the-internet.herokuapp.com/horizontal_slider');
    });

    test('should display horizontal slider page', async ({ page }) => {
      await expect(page.getByText('Horizontal Slider')).toBeVisible();
      await expect(page.locator('input[type="range"]')).toBeVisible();
    });

    test('should move slider and display value', async ({ page }) => {
      const slider = page.locator('input[type="range"]');
      const valueDisplay = page.locator('#range');
      
      // Check initial value
      await expect(valueDisplay).toHaveText('4');
      await expect(slider).toHaveValue('4');
      
      // Move slider to maximum
      await slider.fill('5');
      await expect(valueDisplay).toHaveText('5');
      await expect(slider).toHaveValue('5');
      
      // Move slider to minimum
      await slider.fill('0');
      await expect(valueDisplay).toHaveText('0');
      await expect(slider).toHaveValue('0');
      
      // Move to middle
      await slider.fill('2.5');
      await expect(valueDisplay).toHaveText('2.5');
      await expect(slider).toHaveValue('2.5');
    });

    test('should handle arrow keys', async ({ page }) => {
      const slider = page.locator('input[type="range"]');
      const valueDisplay = page.locator('#range');
      
      await slider.fill('2');
      await expect(valueDisplay).toHaveText('2');
      
      // Use arrow keys
      await slider.press('ArrowRight');
      await expect(valueDisplay).toHaveText('2.5');
      
      await slider.press('ArrowLeft');
      await expect(valueDisplay).toHaveText('2');
      
      await slider.press('ArrowUp');
      await expect(valueDisplay).toHaveText('2.5');
      
      await slider.press('ArrowDown');
      await expect(valueDisplay).toHaveText('2');
    });
  });
});
