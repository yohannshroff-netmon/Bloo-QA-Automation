// ...existing code...
import { test, expect } from '@playwright/test';

test('Open Import modal', async ({ page }) => {

  // --- Login ---
  await page.goto('https://bloo-qa.dnifuat.com/#/auth/login', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await expect(page.getByRole('textbox', { name: 'you@company.com' })).toBeVisible({ timeout: 15000 });
  await page.getByRole('textbox', { name: 'you@company.com' }).fill('yohann.shroff@bloo.io');
  await page.getByRole('button', { name: 'Continue with Password' }).click();
  await page.getByRole('textbox', { name: '••••••••' }).fill('Doctorwho@6c');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForLoadState('networkidle');
  // Navigate to Dashboards
  await page.getByRole('button', { name: 'SIEM' }).click();
  await page.getByRole('link', { name: 'Dashboards' }).click();
  await page.waitForLoadState('networkidle');

  // Use the explicit button label instead of a fragile nth() selector
  const importButton = page.getByRole('button', { name: 'Upload file' });
  await expect(importButton).toBeVisible({ timeout: 10000 });
  await expect(importButton).toBeEnabled({ timeout: 5000 });
  await importButton.click();

  await expect(page.getByText('Import Dashboard')).toBeVisible();
  await expect(page.getByText('Supported formats')).toBeVisible();
  await expect(page.getByText('tar.gz')).toBeVisible();
  await expect(page.getByText('zip')).toBeVisible();
});