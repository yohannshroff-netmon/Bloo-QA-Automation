import { test, expect } from '@playwright/test';

test('selected-export', async ({ page }) => {
  await page.goto('https://bloo-qa.dnifuat.com/#/auth/login');
  await page.getByRole('textbox', { name: 'you@company.com' }).click();
  await page.getByRole('textbox', { name: 'you@company.com' }).fill('yohann.shroff@bloo.io');
  await page.getByRole('button', { name: 'Continue with Password' }).click();
  await page.getByRole('textbox', { name: '••••••••' }).click({
    modifiers: ['Shift']
  });
  await page.getByRole('textbox', { name: '••••••••' }).click();
  await page.getByRole('textbox', { name: '••••••••' }).fill('Doctorwho@6c');
  await page.getByRole('textbox', { name: '••••••••' }).press('Enter');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByRole('button', { name: 'SIEM' }).click();
  await page.getByRole('navigation').getByText('DashboardsWorkbooksReportsMITRE ATT&CK').click();
  await page.getByRole('link', { name: 'Dashboards' }).click();
  await page.getByRole('row', { name: 'Select row SME-TEST Public -' }).getByLabel('Select row').click();
  await page.getByRole('button', { name: 'Export data' }).click();
  await page.locator('div').filter({ hasText: /^Export Dashboards as tar\.gz$/ }).first().click();
  await page.locator('div').filter({ hasText: /^CancelExport$/ }).first().click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export' }).click();
  const download = await downloadPromise;
  await page.getByRole('row', { name: 'Select row SME-TEST Public -' }).getByLabel('Select row').click();
});