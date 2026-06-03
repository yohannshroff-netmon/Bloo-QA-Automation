import { test, expect } from '@playwright/test';

test('list-export', async ({ page }) => {
  // --- Login ---
  await page.goto('https://bloo-qa.dnifuat.com/#/auth/login', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await expect(page.getByRole('textbox', { name: 'you@company.com' })).toBeVisible({ timeout: 15000 });
  await page.getByRole('textbox', { name: 'you@company.com' }).fill('yohann.shroff@bloo.io');
  await page.getByRole('button', { name: 'Continue with Password' }).click();
  await page.getByRole('textbox', { name: '••••••••' }).fill('Doctorwho@6c');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForLoadState('networkidle');

  // --- Navigate to Dashboards ---
  await page.getByRole('button', { name: 'SIEM' }).click();
  await page.getByRole('link', { name: 'Dashboards' }).click();
  await page.waitForLoadState('networkidle');

  // --- Wait for Export button enabled then click ---
  const exportButton = page.getByRole('button', { name: 'Export data' });
  let enabled = false;
  for (let i = 0; i < 30; i++) {
    if (await exportButton.isEnabled()) {
      enabled = true;
      break;
    }
    await page.waitForTimeout(1000);
  }
  expect(enabled).toBeTruthy();
  await exportButton.click();

  // --- Wait for modal then click modal Export ---
  const dialogHeading = page.getByRole('heading', { name: 'Dashboards' }).last();
  await dialogHeading.waitFor({ state: 'visible', timeout: 15000 });
  // Heading is now confirmed visible; scope the dialog by the heading's ancestor
  const exportDialog = dialogHeading.locator('xpath=ancestor::div[@role="dialog"]').first();

  // --- Trigger download ---
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 60000 }),
    exportDialog.getByRole('button', { name: /^Export$/ }).click()
  ]);

  // --- Assert download ---
  const filename = (download.suggestedFilename() || '').toLowerCase();
  expect(filename).toBeTruthy();
});