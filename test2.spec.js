import { test, expect } from '@playwright/test';

test('test2', async ({ page }) => {
  // --- Login ---
  await page.goto('https://bloo-qa.dnifuat.com/#/auth/login', {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });

  await expect(
    page.getByRole('textbox', { name: 'you@company.com' })
  ).toBeVisible({ timeout: 15000 });

  await page
    .getByRole('textbox', { name: 'you@company.com' })
    .fill('yohann.shroff@bloo.io');

  await page
    .getByRole('button', { name: 'Continue with Password' })
    .click();

  await page
    .getByRole('textbox', { name: '••••••••' })
    .fill('Doctorwho@6c');

  await page
    .getByRole('button', { name: 'Sign In' })
    .click();

  await page.waitForLoadState('networkidle');

  await expect(
    page.getByRole('button', { name: 'Open user menu' })
  ).toBeVisible({ timeout: 15000 });

  // rest of your test...
});