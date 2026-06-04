import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://bloo-qa.dnifuat.com/#/auth/login');
  await page.getByRole('textbox', { name: 'you@company.com' }).fill('yohann.shroff@bloo.io');
  await page.getByRole('textbox', { name: 'you@company.com' }).press('Enter');
  await page.getByRole('textbox', { name: '••••••••' }).click();
  await page.getByRole('textbox', { name: '••••••••' }).fill('Doctorwho@6c');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByRole('button', { name: 'SIEM' }).click();
  await page.getByRole('link', { name: 'Dashboards' }).click();
  await page.getByRole('button', { name: 'Add Dashboard' }).click();
  await page.getByRole('button', { name: 'Add Widget' }).first().click();
  await page.getByRole('button', { name: 'Top 10 Email Deletion Metrics' }).click();
  await page.getByRole('button', { name: 'Top 10 Email Deletion Metrics' }).click();
  await page.getByRole('button', { name: 'Top 10 Email Deletion Metrics' }).click();
  await page.getByRole('button', { name: 'Top 10 Email Deletion Metrics' }).click();
  await page.getByRole('button', { name: 'Done' }).click();
  await page.getByRole('textbox', { name: 'Dashboard name…' }).click();
  await page.getByRole('textbox', { name: 'Dashboard name…' }).fill('PW-E2E-Test');
//dont edit above this

const widgetCard = page
  .locator('[class*="chart-card"], [class*="widget"]')
  .filter({
    has: page.getByText('Top 10 Email Deletion Metrics', { exact: true })
  })
  .first();

await expect(widgetCard).toBeVisible();

// Click the last action button in the widget header
await widgetCard.getByRole('button').last().click();

await page.getByRole('button', { name: 'Save Dashboard' }).click({
  timeout: 30000
});

await page.getByText('PW-E2E-Test').click();

await page.getByRole('button', { name: 'Delete' }).first().click();
await page.getByRole('button', { name: 'Delete' }).click();
await page
  .getByRole('row', { name: 'Select row SME-TEST Public -' })
  .getByLabel('Select row')
  .click();
await page.getByRole('button', { name: 'Refresh data' }).click();
});
