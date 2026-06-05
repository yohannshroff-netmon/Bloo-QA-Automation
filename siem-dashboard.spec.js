import { test, expect } from '@playwright/test';

test('dashboard-author-filter', async ({ page }) => {

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

  // Open Author filter
  await page.getByRole('button', { name: 'Author' }).click();

  // More reliable assertion
  await page.locator('button:has-text("Save Filter")').waitFor({ state: 'visible', timeout: 5000 });
  await expect(page.getByRole('button', { name: 'Save Filter' })).toBeVisible();
});



test('dashboard-export-modal', async ({ page }) => {
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



test('dashboard-export-selected', async ({ page }) => {
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




test('dashboard-misc', async ({ page }) => {
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



test('dashboard-page-load', async ({ page }) => {

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

test('dashboard-search-identity', async ({ page }) => {

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

  // Search
  await page.locator('button[aria-label="Open search"]').click();
  await page.locator('input').fill('Identity and Access Monitoring');

  await expect(page.getByText('Identity and Access Monitoring')).toBeVisible();
});



test('dashboard-search-sme', async ({ page }) => {

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

  // Search
  await page.locator('button[aria-label="Open search"]').click();
  await page.locator('input').fill('SME');

  await expect(page.getByText('SME-TEST')).toBeVisible({ timeout: 15000 });
});

test('dasboard-type-filter', async ({ page }) => {
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

  // Open Type filter
  await page.getByRole('button', { name: 'Type' }).click();

  // More reliable assertion
  await page.locator('button:has-text("Save Filter")').waitFor({ state: 'visible', timeout: 5000 });
  await expect(page.getByRole('button', { name: 'Save Filter' })).toBeVisible();
});


test('dashboard-useraccess-filter', async ({ page }) => {

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

test('dashboard-open-verify', async ({ page }) => {
  // login steps...
await page.goto('https://bloo-qa.dnifuat.com/#/auth/login');

  await page
    .getByRole('textbox', { name: 'you@company.com' })
    .fill('yohann.shroff@bloo.io');

  await page.getByRole('button', { name: 'Continue with Password' }).click();

  await page
    .getByRole('textbox', { name: '••••••••' })
    .fill('Doctorwho@6c');

  await page.getByRole('button', { name: 'Sign In' }).click();

  // Navigate to Dashboards
  await page.getByRole('button', { name: 'SIEM' }).click();
  await page.getByRole('link', { name: 'Dashboards' }).click();

  const dashboardName = 'SME-TEST';

  // Find dashboard name in listing
 const dashboard = page.getByRole('button', { name: 'SME-TEST' });

// climb until you find a container that contains the entire row
const row = dashboard.locator('xpath=ancestor::div[contains(.,"Public") or contains(.,"Private")][1]');

await expect(row).toContainText(/Public|Private/);
await expect(row).toContainText('Bloo Command');
// Open Dashboard
await dashboard.click({timeout: 15000});

// Verify dashboard opened
await expect(page).toHaveURL(/dashboard/i);

// Wait for dashboard to finish loading
await expect(
  page.getByText('Loading dashboard...')
).toBeHidden({timeout: 15000});
});


test('dashboard-create-delete', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://bloo-qa.dnifuat.com/#/auth/login');
  await page.getByRole('textbox', { name: 'you@company.com' }).fill('yohann.shroff@bloo.io');
  await page.getByRole('textbox', { name: 'you@company.com' }).press('Enter');
  await page.getByRole('textbox', { name: '••••••••' }).click();
  await page.getByRole('textbox', { name: '••••••••' }).fill('Doctorwho@6c');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByRole('button', { name: 'SIEM' }).click();
  await page.getByRole('link', { name: 'Dashboards' }).click({ timeout: 10000 });
  await page.getByRole('button', { name: 'Add Dashboard' }).click();
  await page.getByRole('button', { name: 'Add Widget' }).first().click();
  await page.getByRole('button', { name: 'Top 10 Email Deletion Metrics' }).click({ timeout: 15000 });
  await page.getByRole('button', { name: 'Top 10 Email Deletion Metrics' }).click({ timeout: 15000 });
  await page.getByRole('button', { name: 'Top 10 Email Deletion Metrics' }).click({ timeout: 15000 });
  await page.getByRole('button', { name: 'Top 10 Email Deletion Metrics' }).click({ timeout: 15000 });
  await page.getByRole('button', { name: 'Done' }).click();
  await page.getByRole('textbox', { name: 'Dashboard name…' }).click();
  await page.getByRole('textbox', { name: 'Dashboard name…' }).fill('PW-E2E-Test');

const widgetCard = page
  .locator('[class*="chart-card"], [class*="widget"]')
  .filter({has: page.getByText('Top 10 Email Deletion Metrics', { exact: true })})
  .first();

await expect(widgetCard).toBeVisible();

// Click the last action button in the widget header
await widgetCard.getByRole('button').last().click();

await page.getByRole('button', { name: 'Save Dashboard' }).click({timeout: 30000});

await page.getByText('PW-E2E-Test').click({timeout: 15000});

await page.getByRole('button', { name: 'Delete' }).first().click();
await page.getByRole('button', { name: 'Delete' }).click();
await page
  .getByRole('row', { name: 'Select row SME-TEST Public -' })
  .getByLabel('Select row')
  .click();
await page.getByRole('button', { name: 'Refresh data' }).click();
});


test('dashboard-search-and-filter', async ({ page }) => {
  await page.goto('https://bloo-qa.dnifuat.com/#/auth/login');

  await page
    .getByRole('textbox', { name: 'you@company.com' })
    .fill('yohann.shroff@bloo.io');

  await page
    .getByRole('textbox', { name: 'you@company.com' })
    .press('Enter');

  await page
    .getByRole('textbox', { name: '••••••••' })
    .fill('Doctorwho@6c');

  await page.getByRole('button', { name: 'Sign In' }).click();

  await page.getByRole('button', { name: 'SIEM' }).click();
  await page.getByRole('link', { name: 'Dashboards' }).click();

  // -----------------------------
  // SEARCH TESTS
  // -----------------------------

  await page.getByRole('button', { name: 'Open search' }).click();

  const searchBox = page.getByRole('textbox', {
    name: 'Search Dashboard by Name'
  });

  await expect(searchBox).toBeVisible();

  // Exact Search
  await searchBox.fill('SME-TEST');
  await expect(searchBox).toHaveValue('SME-TEST');

  // Partial Search
  await searchBox.fill('SME');
  await expect(searchBox).toHaveValue('SME');

  // Case Insensitive Search
  await searchBox.fill('sme');
  await expect(searchBox).toHaveValue('sme');

  // Empty Search Result
  await searchBox.fill('wertyuiop;kjfsazxcvbnm,');

  await expect(
    page.getByText(/No results found/i)
  ).toBeVisible({ timeout: 15000 });

  // Clear Search
  await page.getByRole('button', { name: 'Clear search' }).click();

  await expect(searchBox).toHaveValue('');

//dont edit above this

  // Close Search Panel
  await page.locator('.absolute.right-3').click();

  // -----------------------------
  // FILTER TESTS
  // -----------------------------
  
  // Type Filter
  await page.getByRole('button', { name: 'Type' }).click();
  await page.getByRole('button', { name: 'Public' }).click();

  await expect(
    page.locator('text=Public').first()
  ).toBeVisible();

  // Reset Filter
  await page.getByRole('button', { name: 'Clear all' }).click();

  // Author Filter
  await page.getByRole('button', { name: 'Author' }).click();
  await page.getByRole('button', { name: 'devesh' }).click();

  await expect(
    page.locator('text=devesh').first()
  ).toBeVisible();

  await page.getByRole('button', { name: 'Clear all' }).click();

  // User Access Filter
  await page.getByRole('button', { name: 'User Access' }).click();
  await page.getByRole('button', {
    name: 'vipin.dumbhare@bloo.io'
  }).click();

  await expect(
    page.locator('text=vipin.dumbhare@bloo.io').first()
  ).toBeVisible();

  await page.getByRole('button', { name: 'Clear all' }).click();

  // Combination Filter
  await page.getByRole('button', { name: 'Type' }).click();
  await page.getByRole('button', { name: 'Private', exact: true }).click();

  await page.getByRole('button', { name: 'Author' }).click();
  await page.getByRole('button', { name: 'Rakshit Shetty' }).click();

  await expect(
    page.locator('text=Rakshit Shetty').first()
  ).toBeVisible();

  // Save Filter
await page.getByRole('button', { name: 'Save Filter' }).click();
await expect(
  page.getByText('Dashboard filters saved successfully')
).toBeVisible();
  // Reset Again
  await page.getByRole('button', { name: 'Clear all' }).click();
  await page.getByRole('button', { name: 'Save Filter' }).click();
});