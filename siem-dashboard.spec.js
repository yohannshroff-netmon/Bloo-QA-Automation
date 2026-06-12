import { test, expect } from '@playwright/test';

const EMAIL = process.env.BLOOTEST_EMAIL;
const PASSWORD = process.env.BLOOTEST_PASSWORD;
const BASE_URL = process.env.URL;

async function login(page) {
  await page.goto(`${BASE_URL}/#/auth/login`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await expect(page.getByRole('textbox', { name: 'you@company.com' })).toBeVisible({ timeout: 15000 });
  await page.getByRole('textbox', { name: 'you@company.com' }).fill(EMAIL);
  await page.getByRole('button', { name: 'Continue with Password' }).click();
  await page.getByRole('textbox', { name: '••••••••' }).fill(PASSWORD);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('button', { name: 'Open user menu' })).toBeVisible({ timeout: 30000 });
}

async function gotoDashboards(page) {
  await page.getByRole('button', { name: 'SIEM' }).click();
  await page.getByRole('link', { name: 'Dashboards' }).click();
  await page.waitForLoadState('networkidle');
  await expect(page.getByText('Manage and view your security dashboards')).toBeVisible({ timeout: 30000 });
}

async function waitAndClickRefresh(page) {
  const refreshButton = page.getByRole('button', { name: 'Refresh data' });
  await expect(refreshButton).toBeEnabled({ timeout: 30000 });
  await refreshButton.click();
  await page.waitForLoadState('networkidle');
}

test.describe('SIEM Dashboards', () => {
  test('dashboard-author-filter', async ({ page }) => {
    await login(page);
    await gotoDashboards(page);

    await page.getByRole('button', { name: 'Author' }).click();
    await page.locator('button:has-text("Save Filter")').waitFor({ state: 'visible', timeout: 10000 });
    await expect(page.getByRole('button', { name: 'Save Filter' })).toBeVisible();
  });

  test('dashboard-export-modal', async ({ page }) => {
    await login(page);
    await gotoDashboards(page);

    const exportButton = page.getByRole('button', { name: 'Export data' });
    await expect(exportButton).toBeEnabled({ timeout: 30000 });
    await exportButton.click();

    const dialogHeading = page.getByRole('heading', { name: 'Dashboards' }).last();
    await dialogHeading.waitFor({ state: 'visible', timeout: 15000 });
    const exportDialog = dialogHeading.locator('xpath=ancestor::div[@role="dialog"]').first();

    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 60000 }),
      exportDialog.getByRole('button', { name: /^Export$/ }).click()
    ]);

    expect(download.suggestedFilename()).toBeTruthy();
  });

  test('dashboard-export-selected', async ({ page }) => {
    await login(page);
    await gotoDashboards(page);

    const firstRow = page.locator('tbody tr').first();
    await expect(firstRow).toBeVisible({ timeout: 30000 });
    await firstRow.getByLabel('Select row').click();

    await page.getByRole('button', { name: 'Export data' }).click();
    const exportDialog = page.getByRole('dialog', { name: 'Export Dashboards as tar.gz' });
    await expect(exportDialog).toBeVisible({ timeout: 15000 });

    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 60000 }),
      exportDialog.getByRole('button', { name: 'Export' }).click()
    ]);

    expect(download.suggestedFilename()).toBeTruthy();
  });

  test('dashboard-misc', async ({ page }) => {
    await login(page);

    // Dark / Light mode toggle
    await page.getByRole('button', { name: 'Open user menu' }).click();
    await page.getByRole('button', { name: 'Dark Mode' }).click();
    await page.getByRole('button', { name: 'Open user menu' }).click();
    await page.getByRole('button', { name: 'Light Mode' }).click();

    await gotoDashboards(page);
    await waitAndClickRefresh(page);

    // Sign out
    await page.getByRole('button', { name: 'Open user menu' }).click();
    await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Sign out' }).click();
    await expect(page).toHaveURL(/#\/auth\/login/);
  });

  test('dashboard-page-load', async ({ page }) => {
    await login(page);
    await gotoDashboards(page);
    await expect(page.getByText('Manage and view your security dashboards')).toBeVisible();
  });

  test('dashboard-search-identity', async ({ page }) => {
    await login(page);
    await gotoDashboards(page);

    await page.locator('button[aria-label="Open search"]').click();
    const searchInput = page.getByPlaceholder('Search Dashboard by Name');
    await searchInput.fill('Identity and Access Monitoring');

    await expect(page.getByText('Identity and Access Monitoring')).toBeVisible({ timeout: 15000 });
  });

  test('dashboard-search-sme', async ({ page }) => {
    await login(page);
    await gotoDashboards(page);

    await page.locator('button[aria-label="Open search"]').click();
    const searchInput = page.getByPlaceholder('Search Dashboard by Name');
    await searchInput.fill('SME-TEST');

    await expect(page.getByText('SME-TEST')).toBeVisible({ timeout: 15000 });
  });

  test('dashboard-type-filter', async ({ page }) => {
    await login(page);
    await gotoDashboards(page);

    await page.getByRole('button', { name: 'Type' }).click();
    await page.locator('button:has-text("Save Filter")').waitFor({ state: 'visible', timeout: 10000 });
    await expect(page.getByRole('button', { name: 'Save Filter' })).toBeVisible();
  });

  test('dashboard-useraccess-filter', async ({ page }) => {
    await login(page);
    await gotoDashboards(page);

    await page.getByRole('button', { name: 'User Access' }).click();
    await page.locator('button:has-text("Save Filter")').waitFor({ state: 'visible', timeout: 10000 });
    await expect(page.getByRole('button', { name: 'Save Filter' })).toBeVisible();
  });

  test('dashboard-open-verify', async ({ page }) => {
    await login(page);
    await gotoDashboards(page);

    const dashboardLink = page.locator('tbody tr td button').first();
    await expect(dashboardLink).toBeVisible({ timeout: 30000 });
    const dashboardName = await dashboardLink.innerText();
    
    await dashboardLink.click();
    await expect(page).toHaveURL(/dashboard\/[^/]+/);
    await expect(page.getByText('Loading dashboard...')).toBeHidden({ timeout: 30000 });
    await expect(page.getByRole('heading', { name: dashboardName.trim() })).toBeVisible({ timeout: 15000 });
  });

  test('dashboard-create-delete', async ({ page }) => {
    test.setTimeout(180000);
    await login(page);
    await gotoDashboards(page);

    const tempName = `PW-Temp-${Date.now()}`;

    await page.getByRole('button', { name: 'Add Dashboard' }).click();
    await expect(page.getByRole('button', { name: 'Add Widget' }).first()).toBeVisible({ timeout: 30000 });
    
    await page.getByRole('button', { name: 'Add Widget' }).first().click();
    const firstWidget = page.locator('.grid button').first();
    await expect(firstWidget).toBeVisible({ timeout: 15000 });
    await firstWidget.click();
    await page.getByRole('button', { name: 'Done' }).click();

    await page.getByPlaceholder('Dashboard name…').fill(tempName);
    await page.getByRole('button', { name: 'Save Dashboard' }).click();
    
    await expect(page.getByText('Dashboard saved successfully')).toBeVisible({ timeout: 30000 });
    await expect(page).toHaveURL(/\/siem\/dashboards/);

    // Search and Delete
    await page.locator('button[aria-label="Open search"]').click();
    await page.getByPlaceholder('Search Dashboard by Name').fill(tempName);
    
    const row = page.locator('tbody tr').filter({ hasText: tempName });
    await expect(row).toBeVisible({ timeout: 15000 });
    
    await row.getByRole('button', { name: 'Delete' }).click();
    await page.getByRole('button', { name: 'Delete', exact: true }).click();
    
    await expect(page.getByText('deleted successfully')).toBeVisible({ timeout: 15000 });
  });

  test('dashboard-search-and-filter', async ({ page }) => {
    await login(page);
    await gotoDashboards(page);

    await page.getByRole('button', { name: 'Open search' }).click();
    const searchBox = page.getByPlaceholder('Search Dashboard by Name');
    await expect(searchBox).toBeVisible();

    await searchBox.fill('SME-TEST');
    await expect(page.getByText('SME-TEST')).toBeVisible();

    await page.getByRole('button', { name: 'Clear search' }).click();
    await expect(searchBox).toHaveValue('');

    // Filters
    await page.getByRole('button', { name: 'Type' }).click();
    await page.getByRole('button', { name: 'Public', exact: true }).click();
    await expect(page.locator('button:has-text("Save Filter")')).toBeVisible();

    await page.getByRole('button', { name: 'Clear all' }).click();
    await page.getByRole('button', { name: 'Save Filter' }).click();
    await expect(page.getByText('Dashboard filters saved successfully')).toBeVisible();
  });
});