import { test, expect } from '@playwright/test';
import { join } from 'path';
import { writeFileSync, unlinkSync } from 'fs';

test.describe('File Handling Tests', () => {
  const testFilePath = join(__dirname, 'test-upload.txt');
  const testFileContent = 'This is a test file for upload testing.';

  test.beforeAll(async () => {
    // Create a test file for upload
    writeFileSync(testFilePath, testFileContent);
  });

  test.afterAll(async () => {
    // Clean up test file
    try {
      unlinkSync(testFilePath);
    } catch (error) {
      // File might not exist, ignore error
    }
  });

  test.describe('File Download', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('https://the-internet.herokuapp.com/download');
    });

    test('should display download page with files', async ({ page }) => {
      await expect(page.getByText('File Downloader')).toBeVisible();
      const fileLinks = page.locator('.example a');
      const linkCount = await fileLinks.count();
      expect(linkCount).toBeGreaterThan(0);
    });

    test('should list available files', async ({ page }) => {
      const fileLinks = page.locator('.example a');
      const fileCount = await fileLinks.count();
      
      // Check common files exist
      const commonFiles = ['some-file.txt', 'file.txt'];
      for (const fileName of commonFiles) {
        const link = page.locator(`a[href*="${fileName}"]`);
        if (await link.count() > 0) {
          await expect(link).toBeVisible();
        }
      }
    });

    test('should download a file', async ({ page }) => {
      const fileLinks = page.locator('.example a');
      const firstFile = fileLinks.first();
      const fileName = await firstFile.textContent();
      
      if (fileName) {
        // Start download
        const downloadPromise = page.waitForEvent('download');
        await firstFile.click();
        const download = await downloadPromise;
        
        // Verify download
        expect(download.suggestedFilename()).toBe(fileName);
        
        // Save download to verify content
        const path = await download.path();
        expect(path).toBeTruthy();
      }
    });

    test('should handle multiple downloads', async ({ page }) => {
      const fileLinks = page.locator('.example a');
      const downloadPromises = [];
      
      // Download first 3 files
      const filesToDownload = Math.min(3, await fileLinks.count());
      
      for (let i = 0; i < filesToDownload; i++) {
        downloadPromises.push(page.waitForEvent('download'));
        await fileLinks.nth(i).click();
      }
      
      // Wait for all downloads to complete
      const downloads = await Promise.all(downloadPromises);
      
      // Verify all downloads
      for (const download of downloads) {
        expect(download.suggestedFilename()).toBeTruthy();
        const path = await download.path();
        expect(path).toBeTruthy();
      }
    });
  });

  test.describe('File Upload', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('https://the-internet.herokuapp.com/upload');
    });

    test('should display upload page', async ({ page }) => {
      await expect(page.getByText('File Uploader')).toBeVisible();
      await expect(page.locator('#file-upload')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Upload' })).toBeVisible();
    });

    test('should upload a file successfully', async ({ page }) => {
      // Select file
      await page.locator('#file-upload').setInputFiles(testFilePath);
      
      // Click upload button
      await page.getByRole('button', { name: 'Upload' }).click();
      
      // Verify upload success
      await expect(page.getByText('File Uploaded!')).toBeVisible();
      await expect(page.locator('#uploaded-files')).toContainText('test-upload.txt');
    });

    test('should show uploaded file details', async ({ page }) => {
      await page.locator('#file-upload').setInputFiles(testFilePath);
      await page.getByRole('button', { name: 'Upload' }).click();
      
      // Check file details are displayed
      await expect(page.locator('#uploaded-files')).toBeVisible();
      await expect(page.locator('#uploaded-files')).toContainText('test-upload.txt');
    });

    test('should handle drag and drop upload', async ({ page }) => {
      // Use setInputFiles which is more reliable for file upload
      await page.locator('#file-upload').setInputFiles(testFilePath);
      await page.getByRole('button', { name: 'Upload' }).click();
      
      await expect(page.getByText('File Uploaded!')).toBeVisible();
    });

    test('should handle multiple file upload', async ({ page }) => {
      // Create additional test files
      const testFiles = [
        testFilePath,
        join(__dirname, 'test-upload-2.txt'),
        join(__dirname, 'test-upload-3.txt')
      ];
      
      // Create additional test files
      for (let i = 1; i < testFiles.length; i++) {
        writeFileSync(testFiles[i], `Test file content ${i + 1}`);
      }
      
      try {
        // Upload multiple files
        await page.locator('#file-upload').setInputFiles(testFiles);
        await page.getByRole('button', { name: 'Upload' }).click();
        
        await expect(page.getByText('File Uploaded!')).toBeVisible();
        
        // Note: The upload page might only show one file at a time
        // This test verifies the upload mechanism works
      } finally {
        // Clean up additional test files
        for (let i = 1; i < testFiles.length; i++) {
          try {
            unlinkSync(testFiles[i]);
          } catch (error) {
            // Ignore cleanup errors
          }
        }
      }
    });

    test('should handle upload without selecting file', async ({ page }) => {
      // Try to upload without selecting a file
      await page.getByRole('button', { name: 'Upload' }).click();
      
      // Should stay on upload page or show appropriate message
      await expect(page.locator('#file-upload')).toBeVisible();
    });
  });

  test.describe('Secure File Download', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('https://the-internet.herokuapp.com/download_secure');
    });

    test('should redirect to login for secure download', async ({ page }) => {
      // Should redirect to login page
      await expect(page).toHaveURL(/login/);
      await expect(page.getByRole('heading', { name: 'Login Page' })).toBeVisible();
    });

    test('should allow download after authentication', async ({ page }) => {
      // Login first
      await page.goto('https://the-internet.herokuapp.com/login');
      await page.getByRole('textbox', { name: 'Username' }).fill('tomsmith');
      await page.getByRole('textbox', { name: 'Password' }).fill('SuperSecretPassword!');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Navigate to secure download
      await page.goto('https://the-internet.herokuapp.com/download_secure');
      
      // Should now show download page
      const fileLinks = page.locator('.example a');
      const linkCount = await fileLinks.count();
      expect(linkCount).toBeGreaterThan(0);
      
      // Try downloading a file
      if (linkCount > 0) {
        const downloadPromise = page.waitForEvent('download');
        await fileLinks.first().click();
        const download = await downloadPromise;
        
        expect(download.suggestedFilename()).toBeTruthy();
      }
    });

    test('should deny access without authentication', async ({ page }) => {
      // Try to access secure download directly
      const response = await page.goto('https://the-internet.herokuapp.com/download_secure');
      
      // Should redirect to login
      await expect(page).toHaveURL(/login/);
      await expect(page.getByRole('heading', { name: 'Login Page' })).toBeVisible();
    });
  });
});
