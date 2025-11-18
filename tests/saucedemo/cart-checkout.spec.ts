import { test, expect } from '@playwright/test';
import {
  login,
  addItemToCartByName,
  openCart,
  goToCheckout,
  fillCheckoutInformation,
  finishCheckout,
  resetAppState
} from './helpers';

const CUSTOMER = {
  firstName: 'Sauce',
  lastName: 'Customer',
  postalCode: '12345'
};

const ITEMS = ['Sauce Labs Backpack', 'Sauce Labs Bike Light'];

test.describe('SauceDemo Cart & Checkout', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, { username: 'standard_user', password: 'secret_sauce' });
  });

  test.afterEach(async ({ page }) => {
    await resetAppState(page);
  });

  test('should add multiple items to cart and update badge', async ({ page }) => {
    for (const item of ITEMS) {
      await addItemToCartByName(page, item);
    }

    await expect(page.locator('.shopping_cart_badge')).toHaveText(String(ITEMS.length));

    await openCart(page);
    const cartItems = page.locator('.cart_item');
    await expect(cartItems).toHaveCount(ITEMS.length);

    // Remove one item from cart summary
    await cartItems.first().getByRole('button', { name: 'Remove' }).click();
    await expect(page.locator('.cart_item')).toHaveCount(ITEMS.length - 1);

    await page.locator('[data-test="continue-shopping"]').click();
    await expect(page).toHaveURL(/inventory.html/);
  });

  test('should require customer information before checkout', async ({ page }) => {
    await addItemToCartByName(page, ITEMS[0]);
    await goToCheckout(page);

    // Missing all fields
    await page.click('[data-test="continue"]');
    await expect(page.locator('[data-test="error"]')).toHaveText('Error: First Name is required');

    await page.fill('[data-test="firstName"]', CUSTOMER.firstName);
    await page.click('[data-test="continue"]');
    await expect(page.locator('[data-test="error"]')).toHaveText('Error: Last Name is required');

    await page.fill('[data-test="lastName"]', CUSTOMER.lastName);
    await page.click('[data-test="continue"]');
    await expect(page.locator('[data-test="error"]')).toHaveText('Error: Postal Code is required');
  });

  test('should complete checkout successfully', async ({ page }) => {
    for (const item of ITEMS) {
      await addItemToCartByName(page, item);
    }

    await goToCheckout(page);
    await fillCheckoutInformation(page, CUSTOMER);

    // Verify overview
    const summaryItems = page.locator('.inventory_item_name');
    await expect(summaryItems).toHaveCount(ITEMS.length);

    const subtotalText = await page.locator('.summary_subtotal_label').textContent();
    expect(subtotalText).toContain('Item total');

    await finishCheckout(page);
  });

  test('should allow cancelling checkout and returning to cart', async ({ page }) => {
    await addItemToCartByName(page, ITEMS[0]);
    await goToCheckout(page);
    await fillCheckoutInformation(page, CUSTOMER);

    await page.click('[data-test="cancel"]');
    await expect(page).toHaveURL(/inventory.html/);
  });

  test('should allow cancelling during checkout step one', async ({ page }) => {
    await addItemToCartByName(page, ITEMS[0]);
    await goToCheckout(page);

    await page.click('[data-test="cancel"]');
    await expect(page).toHaveURL(/cart.html/);
  });
});
