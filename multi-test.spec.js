import { test, expect } from '@playwright/test';

test('test1', async ({ page }) => {
  // --- Login ---
  await page.goto('https://bloo-qa.dnifuat.com/#/auth/login', {
    waitUntil: 'domcontentloaded',  // don't wait for all assets, just the DOM
    timeout: 60000                  // give it 60s instead of the default 30s
  });
  // Wait for the login form to actually be ready before interacting
  await expect(
    page.getByRole('textbox', { name: 'you@company.com' })
  ).toBeVisible({ timeout: 15000 });

  // rest of test unchanged...
   await page.getByRole('textbox', { name: 'you@company.com' }).fill('yohann.shroff@bloo.io');
  await page.getByRole('button', { name: 'Continue with Password' }).click();
  await page.getByRole('textbox', { name: '••••••••' }).fill('Doctorwho@6c');
  await page.getByRole('button', { name: 'Sign In' }).click();

  // Wait for app to fully load after login
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('button', { name: 'Open user menu' })).toBeVisible({ timeout: 15000 });

  // --- Dark / Light mode toggle ---
  await page.getByRole('button', { name: 'Open user menu' }).click();
  await page.getByRole('button', { name: 'Dark Mode' }).click();

  await page.getByRole('button', { name: 'Open user menu' }).click();
  await page.getByRole('button', { name: 'Light Mode' }).click();

  // --- Navigate to SIEM > Dashboards ---
  await page.getByRole('button', { name: 'SIEM' }).click();
  await page.getByRole('link', { name: 'Dashboards' }).click();
  await page.waitForLoadState('networkidle');

  // --- Apply Type filter ---
  await page.getByRole('button', { name: 'Type' }).click();
  await expect(page.getByRole('button', { name: 'Public' })).toBeVisible({ timeout: 5000 });
  await page.getByRole('button', { name: 'Public' }).click();

  // --- Apply Author filter ---
await page.getByRole('button', { name: 'Author' }).click();
  // Wait for the dropdown list to populate before clicking
  await expect(page.getByRole('button', { name: 'Rakshit Shetty' })).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: 'Rakshit Shetty' }).click();

  // --- Refresh data ---
  await page.getByRole('button', { name: 'Refresh data' }).click();
  await page.waitForLoadState('networkidle');

  // --- Click on Yohann Shroff entry ---
  await expect(
    page.locator('div').filter({ hasText: /^Yohann Shroff$/ }).first()
  ).toBeVisible({ timeout: 10000 });
  await page.locator('div').filter({ hasText: /^Yohann Shroff$/ }).first().click();

  // --- Sign out ---
  await page.getByRole('button', { name: 'Open user menu' }).click();
   await page.getByRole('button', { name: 'Open user menu' }).click();
  await expect(
    page.getByRole('button', { name: 'Sign out' })
  ).toBeVisible({ timeout: 10000 });
  await page.getByRole('button', { name: 'Sign out' }).click();
});