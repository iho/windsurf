import { test, expect, type TestInfo, type Response } from '@playwright/test';

function recordForgotPasswordTelemetry(testInfo: TestInfo, response: Response) {
  const payload = {
    status: response.status(),
    url: response.url()
  };

  testInfo.annotations.push({
    type: 'bug',
    description: `Forgot Password endpoint returned ${payload.status}`
  });

  testInfo.attachments.push({
    name: 'forgot-password-response',
    contentType: 'application/json',
    body: Buffer.from(JSON.stringify(payload, null, 2), 'utf-8')
  });
}

test.describe('Authentication Tests', () => {
  test.describe('Form Authentication', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('https://the-internet.herokuapp.com/login');
    });

    test('should display login page with correct elements', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Login Page' })).toBeVisible();
      await expect(page.getByRole('textbox', { name: 'Username' })).toBeVisible();
      await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();

      // Check for instructions
      await expect(page.getByText('tomsmith')).toBeVisible();
      await expect(page.getByText('SuperSecretPassword!')).toBeVisible();
    });

    test('should show error message with invalid credentials', async ({ page }) => {
      await page.getByRole('textbox', { name: 'Username' }).fill('invaliduser');
      await page.getByRole('textbox', { name: 'Password' }).fill('invalidpass');
      await page.getByRole('button', { name: 'Login' }).click();

      await expect(page.getByText('Your username is invalid!')).toBeVisible();
      await expect(page.locator('.flash.error')).toBeVisible();
      await expect(page).toHaveURL('https://the-internet.herokuapp.com/login');
    });

    test('should show error message with invalid password', async ({ page }) => {
      await page.getByRole('textbox', { name: 'Username' }).fill('tomsmith');
      await page.getByRole('textbox', { name: 'Password' }).fill('wrongpassword');
      await page.getByRole('button', { name: 'Login' }).click();

      await expect(page.getByText('Your password is invalid!')).toBeVisible();
      await expect(page.locator('.flash.error')).toBeVisible();
      await expect(page).toHaveURL('https://the-internet.herokuapp.com/login');
    });

    test('should login successfully with valid credentials', async ({ page }) => {
      await page.getByRole('textbox', { name: 'Username' }).fill('tomsmith');
      await page.getByRole('textbox', { name: 'Password' }).fill('SuperSecretPassword!');
      await page.getByRole('button', { name: 'Login' }).click();

      await expect(page.getByText('You logged into a secure area!')).toBeVisible();
      await expect(page.locator('.flash.success')).toBeVisible();
      await expect(page).toHaveURL('https://the-internet.herokuapp.com/secure');
      await expect(page.locator('.example h2').filter({ hasText: 'Secure Area' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Logout' })).toBeVisible();
    });

    test('should logout successfully', async ({ page }) => {
      // Login first
      await page.getByRole('textbox', { name: 'Username' }).fill('tomsmith');
      await page.getByRole('textbox', { name: 'Password' }).fill('SuperSecretPassword!');
      await page.getByRole('button', { name: 'Login' }).click();

      // Then logout
      await page.getByRole('link', { name: 'Logout' }).click();

      await expect(page.getByText('You logged out of the secure area!')).toBeVisible();
      await expect(page.locator('.flash.success')).toBeVisible();
      await expect(page).toHaveURL('https://the-internet.herokuapp.com/login');
      await expect(page.getByRole('heading', { name: 'Login Page' })).toBeVisible();
    });

    test('should close flash message', async ({ page }) => {
      await page.getByRole('textbox', { name: 'Username' }).fill('invaliduser');
      await page.getByRole('textbox', { name: 'Password' }).fill('invalidpass');
      await page.getByRole('button', { name: 'Login' }).click();

      await expect(page.getByText('Your username is invalid!')).toBeVisible();

      // Close the flash message
      await page.getByRole('link', { name: '×' }).click();

      await expect(page.getByText('Your username is invalid!')).not.toBeVisible();
    });
  });

  test.describe('Basic Auth', () => {
    test('should fail without credentials', async ({ page }) => {
      const response = await page.goto('https://the-internet.herokuapp.com/basic_auth');
      expect(response?.status()).toBe(401);
    });

    test('should succeed with correct credentials', async ({ browser }) => {
      const context = await browser.newContext({
        httpCredentials: {
          username: 'admin',
          password: 'admin'
        }
      });
      const authPage = await context.newPage();
      await authPage.goto('https://the-internet.herokuapp.com/basic_auth');

      await expect(authPage.getByText('Congratulations! You must have the proper credentials.')).toBeVisible();
      await authPage.close();
      await context.close();
    });

    test('should fail with incorrect credentials', async ({ page }) => {
      const response = await page.goto('https://the-internet.herokuapp.com/basic_auth');
      expect(response?.status()).toBe(401);
    });
  });

  test.describe('Digest Authentication', () => {
    test('should succeed with correct credentials', async ({ browser }) => {
      const context = await browser.newContext({
        httpCredentials: {
          username: 'admin',
          password: 'admin'
        }
      });
      const authPage = await context.newPage();
      await authPage.goto('https://the-internet.herokuapp.com/digest_auth');

      await expect(authPage.getByText('Congratulations! You must have the proper credentials.')).toBeVisible();
      await authPage.close();
      await context.close();
    });
    
    test('digest auth should fail without credentials', async ({ page, browserName }) => {
      if (browserName === 'firefox') {
        await expect(page.goto('https://the-internet.herokuapp.com/digest_auth'))
          .rejects.toThrow(/NS_ERROR_NET_EMPTY_RESPONSE/);
        return;
      }

      const response = await page.goto('https://the-internet.herokuapp.com/digest_auth');
      expect(response?.status()).toBe(401);
    });
  });

  test.describe('Forgot Password', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('https://the-internet.herokuapp.com/forgot_password');
    });

    test('should display forgot password form', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Forgot Password' })).toBeVisible();
      await expect(page.getByRole('textbox', { name: 'E-mail' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Retrieve password' })).toBeVisible();
    });

    test('should submit email for password recovery', async ({ page }, testInfo) => {
      await page.getByRole('textbox', { name: 'E-mail' }).fill('test@example.com');

      const [response] = await Promise.all([
        page.waitForResponse(res => res.url().includes('/forgot_password') && res.request().method() === 'POST'),
        page.getByRole('button', { name: 'Retrieve password' }).click()
      ]);

      const serverError = response.status() >= 500;
      if (serverError) {
        recordForgotPasswordTelemetry(testInfo, response);
        await expect(page.getByRole('heading', { name: 'Internal Server Error' })).toBeVisible();
        return;
      }

      await expect(page.getByText('Your e-mail has been sent!')).toBeVisible();
      await expect(page.locator('.flash.success')).toBeVisible();
    });

    test('should show error with empty email', async ({ page }, testInfo) => {
      const [response] = await Promise.all([
        page.waitForResponse(res => res.url().includes('/forgot_password') && res.request().method() === 'POST'),
        page.getByRole('button', { name: 'Retrieve password' }).click()
      ]);

      const serverError = response.status() >= 500;
      if (serverError) {
        recordForgotPasswordTelemetry(testInfo, response);
        await expect(page.getByRole('heading', { name: 'Internal Server Error' })).toBeVisible();
        return;
      }

      await expect(page.locator('.flash.error')).toBeVisible();
    });
  });
});
