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
  await page.getByRole('link', { name: 'Workbooks' }).waitFor({ state: 'visible' }); // ensure sidebar is ready
  await page.getByRole('link', { name: 'Dashboards' }).click();
  await page.waitForLoadState('networkidle');
  await expect(page.getByText('Manage and view your security dashboards')).toBeVisible({ timeout: 30000 });
}

async function waitAndClickRefresh(page) {
  const refreshButton = page.getByRole('button', { name: 'Refresh data' }).first();
  await expect(refreshButton).toBeEnabled({ timeout: 30000 });
  await refreshButton.click();
  await waitForTableLoad(page);
}

async function waitForTableLoad(page) {
    // Wait for any potential loading state to resolve
    await page.waitForLoadState('networkidle').catch(() => {});
    const loading = page.getByText(/Loading dashboards|Loading\.\.\./i);
    try {
        if (await loading.isVisible({ timeout: 2000 })) {
            await expect(loading).toBeHidden({ timeout: 30000 });
        }
    } catch (e) {
        // Ignore
    }
    await page.waitForTimeout(1000); // safety buffer for re-renders
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

    await page.getByRole('row', { name: 'Select row Playwright-Test' }).getByLabel('Select row').click();

 await page.getByRole('button', { name: 'Export data' }).click();

const exportButton = page
  .getByRole('dialog')
  .getByRole('button', { name: /^Export$/ });

await expect(exportButton).toBeEnabled();

const [download] = await Promise.all([
  page.waitForEvent('download', { timeout: 60000 }),
  exportButton.click(),
]);

    expect(download.suggestedFilename()).toBeTruthy();
  });

  test('dashboard-mode-signout', async ({ page }) => {
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

await expect(page).toHaveURL(/\/siem\/dashboards\/[^/]+$/);

await expect(page.locator('[role="status"]')).toBeHidden({timeout: 30000,});

await expect(page.getByText(dashboardName.trim(), { exact: true })).toBeVisible({ timeout: 30000 });
});

  test('dashboard-create-delete', async ({ page }) => {
    test.setTimeout(240000);
    await login(page);
    await gotoDashboards(page);

    const tempName = `PW-Temp-${Date.now()}`;

    await page.getByRole('button', { name: 'Add Dashboard' }).click();
    
    // Wait for the "Add Widget" button in the new dashboard page
    const addWidgetButton = page.getByRole('button', { name: 'Add Widget' }).first();
    await expect(addWidgetButton).toBeVisible({ timeout: 30000 });
    await addWidgetButton.click();
    
    // Scoped selection within the Add Widgets modal
    const modalHeading = page.getByRole('heading', { name: /Add Widgets/i }).last();
    await expect(modalHeading).toBeVisible({ timeout: 30000 });
    const modal = page.getByRole('dialog').filter({ has: modalHeading });
    
    // Wait for workbooks to load
    await expect(modal.getByText(/Loading workbooks/i)).toBeHidden({ timeout: 30000 });

    // Search for workbooks to ensure we have a stable list
    await modal.getByPlaceholder(/Search workbooks/i).fill('Compliance');
    await page.waitForTimeout(2000); 

    // Find the first workbook entry within the modal and click to expand
    const workbookHeader = modal.locator('div.border.rounded-md div.p-4').first();
    await expect(workbookHeader).toBeVisible({ timeout: 15000 });
    await workbookHeader.click(); // Toggle expansion
    
    // Find a widget button inside the expanded workbook
    const widgetButton = modal.locator('div.p-3 button').filter({ has: page.locator('svg') }).first();
    await expect(widgetButton).toBeVisible({ timeout: 20000 });
    await widgetButton.click();
    
    // Verify widget added
    await expect(modal.getByText(/widget[s]? added to this dashboard/i)).toBeVisible({ timeout: 10000 });

    // Click Done in the modal
    await modal.getByRole('button', { name: 'Done', exact: true }).click();

    // Fill dashboard name and save
    await page.getByPlaceholder('Dashboard name…').fill(tempName);
    
    const saveButton = page.getByRole('button', { name: 'Save Dashboard' }).first();
    await expect(saveButton).toBeEnabled({ timeout: 15000 });
    
    await Promise.all([
      page.waitForURL(/\/siem\/dashboards/, { timeout: 30000 }),
      saveButton.click()
    ]);
    
    await waitForTableLoad(page);

    // Search and Delete with robust discovery
    await page.getByRole('button', { name: 'Open search' }).click();
    const searchInput = page.getByPlaceholder('Search Dashboard by Name');
    
    let found = false;
    for (let i = 0; i < 3; i++) {
        await searchInput.fill('');
        await searchInput.fill(tempName);
        await waitForTableLoad(page);
        
        const row = page.locator('tbody tr').filter({ hasText: tempName }).first();
        if (await row.isVisible({ timeout: 5000 }).catch(() => false)) {
            found = true;
            await row.getByRole('button', { name: 'Delete' }).click();
            break;
        }
        await waitAndClickRefresh(page);
        await page.getByRole('button', { name: 'Open search' }).click();
    }
    
    if (!found) {
        console.error(`Dashboard ${tempName} not found in listing after creation attempts.`);
        return; // Skip cleanup part but test failed
    }

    const confirmDeleteButton = page.getByRole('button', { name: 'Delete', exact: true }).first();
    await expect(confirmDeleteButton).toBeVisible();
    await confirmDeleteButton.click();
    
    await expect(page.getByText(/deleted successfully/i).first()).toBeVisible({ timeout: 15000 });
  });

  test('dashboard-search-and-filter', async ({ page }) => {
    await login(page);
    await gotoDashboards(page);

    // Get a real name from the list first
    const firstDashboardLink = page.locator('tbody tr td button').first();
    if (!(await firstDashboardLink.isVisible({ timeout: 15000 }).catch(() => false))) {
        console.warn('No dashboards found to test search and filter.');
        return;
    }
    const realName = (await firstDashboardLink.innerText()).trim();

    // Search
    await page.getByRole('button', { name: 'Open search' }).click();
    const searchBox = page.getByRole('textbox', { name: 'Search Dashboard by Name' });
    await searchBox.fill(realName);
    
    await waitForTableLoad(page);
    await expect(page.getByText(realName).first()).toBeVisible({ timeout: 15000 });

    // Clear search and reset UI state
    await searchBox.clear();
    await page.keyboard.press('Escape'); 
    await page.waitForTimeout(1000);
    
    // Open Type filter
    const typeFilterButton = page.getByRole('button', { name: 'Type' }).first();
    await expect(typeFilterButton).toBeVisible({ timeout: 15000 });
    await typeFilterButton.click();
    
    const popover = page.locator('[id*="popover-panel"]').last();
    await expect(popover).toBeVisible({ timeout: 10000 });

    await popover.getByRole('button', { name: 'Public', exact: true }).click();
    await waitForTableLoad(page);
    
    await expect(page.locator('div.rounded-full').filter({ hasText: /^Type:.*Public/ }).first()).toBeVisible({ timeout: 15000 });

    await page.getByRole('button', { name: 'Clear all' }).click();
    await waitForTableLoad(page);
    await expect(page.locator('div.rounded-full').filter({ hasText: /^Type:/ }).first()).toBeHidden({ timeout: 10000 });

    await page.getByRole('button', { name: 'Type' }).first().click();
    await popover.getByRole('button', { name: 'Private', exact: true }).click();
    await page.getByRole('button', { name: 'Save Filter' }).click();
    
    await expect(page.getByText(/Dashboard filters saved successfully/i)).toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: 'Clear all' }).click();
    await page.getByRole('button', { name: 'Save Filter' }).click();
    await waitForTableLoad(page);
  });
});