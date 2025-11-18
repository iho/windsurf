import { expect, Page } from '@playwright/test';

export const SAUCEDEMO_BASE_URL = 'https://www.saucedemo.com/';

export async function login(
  page: Page,
  {
    username = 'standard_user',
    password = 'secret_sauce'
  }: { username?: string; password?: string } = {}
) {
  await page.goto(SAUCEDEMO_BASE_URL);
  await page.fill('[data-test="username"]', username);
  await page.fill('[data-test="password"]', password);
  await page.click('[data-test="login-button"]');
}

export async function expectOnInventoryPage(page: Page) {
  await expect(page).toHaveURL(/inventory.html/);
  await expect(page.locator('.app_logo')).toHaveText('Swag Labs');
}

export async function addItemToCartByName(page: Page, itemName: string) {
  const itemCard = page.locator('.inventory_item').filter({ hasText: itemName });
  await expect(itemCard).toBeVisible();
  const addButton = itemCard.getByRole('button', { name: /Add to cart/i });
  if (await addButton.count()) {
    await addButton.click();
  }
}

export async function openCart(page: Page) {
  await page.locator('#shopping_cart_container a').click();
  await expect(page).toHaveURL(/cart.html/);
}

export async function resetAppState(page: Page) {
  await page.locator('#react-burger-menu-btn').click();
  await page.locator('#reset_sidebar_link').click();
  await page.locator('#react-burger-cross-btn').click();
}

export async function removeAllCartItems(page: Page) {
  await openCart(page);
  const removeButtons = page.locator('button').filter({ hasText: 'Remove' });
  const count = await removeButtons.count();
  for (let i = 0; i < count; i++) {
    await removeButtons.nth(i).click();
  }
}

export async function goToCheckout(page: Page) {
  await openCart(page);
  await page.click('[data-test="checkout"]');
  await expect(page).toHaveURL(/checkout-step-one.html/);
}

export async function fillCheckoutInformation(
  page: Page,
  info: { firstName: string; lastName: string; postalCode: string }
) {
  await page.fill('[data-test="firstName"]', info.firstName);
  await page.fill('[data-test="lastName"]', info.lastName);
  await page.fill('[data-test="postalCode"]', info.postalCode);
  await page.click('[data-test="continue"]');
  await expect(page).toHaveURL(/checkout-step-two.html/);
}

export async function finishCheckout(page: Page) {
  await page.click('[data-test="finish"]');
  await expect(page).toHaveURL(/checkout-complete.html/);
  await expect(page.getByRole('heading', { name: 'Thank you for your order!' })).toBeVisible();
  await page.click('[data-test="back-to-products"]');
  await expectOnInventoryPage(page);
}
