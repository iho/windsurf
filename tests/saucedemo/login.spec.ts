import { test, expect } from '@playwright/test';
import { SAUCEDEMO_BASE_URL, login, expectOnInventoryPage } from './helpers';

const USERS = {
  standard: { username: 'standard_user', password: 'secret_sauce' },
  locked: { username: 'locked_out_user', password: 'secret_sauce' },
  problem: { username: 'problem_user', password: 'secret_sauce' },
  performance: { username: 'performance_glitch_user', password: 'secret_sauce' }
} as const;

test.describe('SauceDemo Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(SAUCEDEMO_BASE_URL);
  });

  test('should display login form elements', async ({ page }) => {
    await expect(page.locator('.login_logo')).toHaveText('Swag Labs');
    await expect(page.getByPlaceholder('Username')).toBeVisible();
    await expect(page.getByPlaceholder('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
    await expect(page.locator('.login_credentials')).toContainText('Accepted usernames');
  });

  test('should login successfully with standard user', async ({ page }) => {
    await login(page, USERS.standard);
    await expectOnInventoryPage(page);
  });

  test('should logout successfully', async ({ page }) => {
    await login(page, USERS.standard);
    await page.locator('#react-burger-menu-btn').click();
    await page.locator('#logout_sidebar_link').click();

    await expect(page).toHaveURL(SAUCEDEMO_BASE_URL);
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });

  test('should show error for locked out user', async ({ page }) => {
    await login(page, USERS.locked);

    await expect(page.locator('[data-test="error"]')).toContainText('locked out');
    await expect(page).toHaveURL(SAUCEDEMO_BASE_URL);
  });

  test('should show error for missing username', async ({ page }) => {
    await page.fill('[data-test="password"]', USERS.standard.password);
    await page.click('[data-test="login-button"]');

    await expect(page.locator('[data-test="error"]')).toHaveText('Epic sadface: Username is required');
  });

  test('should show error for missing password', async ({ page }) => {
    await page.fill('[data-test="username"]', USERS.standard.username);
    await page.click('[data-test="login-button"]');

    await expect(page.locator('[data-test="error"]')).toHaveText('Epic sadface: Password is required');
  });

  test('should show error for wrong credentials', async ({ page }) => {
    await page.fill('[data-test="username"]', 'standard_user');
    await page.fill('[data-test="password"]', 'wrong_password');
    await page.click('[data-test="login-button"]');

    await expect(page.locator('[data-test="error"]')).toHaveText('Epic sadface: Username and password do not match any user in this service');
  });

  test('should allow closing error message', async ({ page }) => {
    await page.click('[data-test="login-button"]');
    const error = page.locator('[data-test="error"]');
    await expect(error).toBeVisible();

    await error.locator('button.error-button').click();
    await expect(error).toBeHidden();
  });

  test('should toggle password visibility help text', async ({ page }) => {
    await expect(page.locator('[data-test="password"]')).toHaveAttribute('type', 'password');
    await expect(page.locator('.login_password')).toContainText('Password for all users');
  });

  test('problem user should still login but have visual issues', async ({ page }) => {
    await login(page, USERS.problem);
    await expectOnInventoryPage(page);

    // Known issue: product images may be broken
    const firstImage = page.locator('.inventory_item_img img').first();
    await expect(firstImage).toBeVisible();
  });

  test('performance glitch user should login with potential delay', async ({ page }) => {
    await login(page, USERS.performance);
    await expectOnInventoryPage(page);
  });
});
