// ...existing code...
import { test, expect } from '@playwright/test';

test('Dashboard page loads successfully', async ({ page }) => {

  // --- Login ---
  await page.goto('https://bloo-qa.dnifuat.com/#/auth/login', {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });

  await expect(page.getByRole('textbox', { name: 'you@company.com' })).toBeVisible({ timeout: 15000 });
  await page.getByRole('textbox', { name: 'you@company.com' }).fill('yohann.shroff@bloo.io');
  await page.getByRole('button', { name: 'Continue with Password' }).click();
  await page.getByRole('textbox', { name: '••••••••' }).fill('Doctorwho@6c');
  await page.getByRole('button', { name: 'Sign In' }).click();

  // wait for app to load
  await page.waitForLoadState('networkidle');

  // Navigate to SIEM -> Dashboards
  await page.getByRole('button', { name: 'SIEM' }).click();
  await page.getByRole('link', { name: 'Dashboards' }).click();
  await page.waitForLoadState('networkidle');

  // Use a unique page text to assert the page loaded (avoid ambiguous getByText('Dashboards'))
  await expect(page.getByText('Manage and view your security dashboards')).toBeVisible();
});