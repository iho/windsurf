import { test, expect } from '@playwright/test';
import { login, addItemToCartByName, expectOnInventoryPage, resetAppState } from './helpers';

const PRODUCTS = ['Sauce Labs Backpack', 'Sauce Labs Bike Light', 'Sauce Labs Bolt T-Shirt'];

test.describe('SauceDemo Inventory', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, { username: 'standard_user', password: 'secret_sauce' });
    await expectOnInventoryPage(page);
  });

  test.afterEach(async ({ page }) => {
    await resetAppState(page);
  });

  test('should list all catalog items with prices and descriptions', async ({ page }) => {
    const items = page.locator('.inventory_item');
    await expect(items).toHaveCount(6);

    for (const product of PRODUCTS) {
      const card = items.filter({ hasText: product });
      await expect(card.locator('.inventory_item_desc')).toBeVisible();
      await expect(card.locator('.inventory_item_price')).toBeVisible();
      await expect(card.getByRole('button')).toBeVisible();
    }
  });

  test('should add and remove item from cart badge', async ({ page }) => {
    await addItemToCartByName(page, PRODUCTS[0]);
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');

    const itemCard = page.locator('.inventory_item').filter({ hasText: PRODUCTS[0] });
    await itemCard.getByRole('button', { name: 'Remove' }).click();
    await expect(page.locator('.shopping_cart_badge')).toHaveCount(0);
  });

  test('should open product details and add to cart from detail view', async ({ page }) => {
    const targetCard = page.locator('.inventory_item').filter({ hasText: PRODUCTS[1] });
    await targetCard.locator('.inventory_item_name').click();
    await page.waitForURL(/inventory-item\.html/);
    await expect(page.locator('.inventory_details_name')).toHaveText(PRODUCTS[1]);

    await page.getByRole('button', { name: 'Add to cart' }).click();
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');

    await page.getByRole('button', { name: 'Back to products' }).click();
    await expectOnInventoryPage(page);
  });

  test('should support sorting products', async ({ page }) => {
    const select = page.locator('[data-test="product-sort-container"]');
    await select.waitFor({ state: 'visible', timeout: 10000 });

    await select.selectOption('hilo', { timeout: 10000 });
    const pricesDesc = await page.locator('.inventory_item_price').allTextContents();
    const numericDesc = pricesDesc.map(text => Number(text.replace('$', '')));
    const sortedDesc = [...numericDesc].sort((a, b) => b - a);
    expect(numericDesc).toEqual(sortedDesc);

    await select.selectOption('az');
    const namesAsc = await page.locator('.inventory_item_name').allTextContents();
    const sortedAsc = [...namesAsc].sort((a, b) => a.localeCompare(b));
    expect(namesAsc).toEqual(sortedAsc);
  });

  test('should open menu links', async ({ page }) => {
    await page.locator('#react-burger-menu-btn').click();
    await expect(page.locator('#inventory_sidebar_link')).toBeVisible();
    await expect(page.locator('#about_sidebar_link')).toBeVisible();
    await expect(page.locator('#logout_sidebar_link')).toBeVisible();
    await expect(page.locator('#reset_sidebar_link')).toBeVisible();

    await page.locator('#about_sidebar_link').click();
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/saucelabs\.com/);
    await page.goBack();
    await expectOnInventoryPage(page);
  });
});
