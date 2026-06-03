// ...existing code...
import { test, expect } from '@playwright/test';

test('Open User Access filter', async ({ page }) => {

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

  // Open User Access filter
  await page.getByRole('button', { name: 'User Access' }).click();

  // Wait/assert on a visible control inside the opened filter (more reliable than asserting a generic dialog)
  await page.locator('button:has-text("Save Filter")').waitFor({ state: 'visible', timeout: 5000 });
  await expect(page.getByRole('button', { name: 'Save Filter' })).toBeVisible();
});