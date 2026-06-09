import { test, expect } from '@playwright/test';

test.describe.configure({
  timeout: 120000,
});

const BASE_URL = 'https://bloo-qa.dnifuat.com';
const WORKBOOKS_URL = `${BASE_URL}/#/29321b9e-3572-43ee-924d-1c6cbfc7ftot/default/siem/workbooks`;
const EMAIL = process.env.BLOOTEST_EMAIL;
const PASSWORD = process.env.BLOOTEST_PASSWORD;

const SEARCH_PLACEHOLDER = 'Search Workbook by Name';
const FILTERS = {
  stage: 'Stage',
  tactic: 'Tactic',
  technique: 'Technique',
  subTechnique: 'Sub-technique',
  score: 'Score',
  severity: 'Severity',
  enabled: 'Enabled',
  scheduled: 'Scheduled',
  stream: 'Stream',
  tags: 'Tags',
};

async function login(page) {
  await page.goto(`${BASE_URL}/#/auth/login`, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });

  await expect(page.getByRole('textbox', { name: 'you@company.com' })).toBeVisible({
    timeout: 15000,
  });
  await page.getByRole('textbox', { name: 'you@company.com' }).fill(EMAIL);
  await page.getByRole('button', { name: 'Continue with Password' }).click();
  await page.getByRole('textbox', { name: '••••••••' }).fill(PASSWORD);
  await page.getByRole('button', { name: 'Sign In' }).click();

  await expect(page.getByRole('button', { name: 'Open user menu' })).toBeVisible({
    timeout: 30000,
  });
}

async function gotoWorkbooks(page) {
  await page.goto(WORKBOOKS_URL, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });
  await expect(page.getByText('Create and manage your Workbooks')).toBeVisible({
    timeout: 30000,
  });
  await waitForWorkbookTable(page);
}

async function loginAndGotoWorkbooks(page) {
  await login(page);
  await gotoWorkbooks(page);
}

async function waitForWorkbookTable(page) {
  await expect(page.getByText('All Workbooks')).toBeVisible({ timeout: 30000 });
  await expect(page.locator('thead')).toContainText('Name', { timeout: 30000 });
  await expect(page.locator('tbody')).toBeVisible({ timeout: 30000 });
}

async function openSearch(page) {
  await page.getByRole('button', { name: 'Open search' }).click();
  const searchBox = page.getByRole('textbox', { name: SEARCH_PLACEHOLDER });
  await expect(searchBox).toBeVisible({ timeout: 10000 });
  return searchBox;
}

async function clearSearch(page, searchBox) {
  await searchBox.fill('');
  await page.waitForLoadState('networkidle').catch(() => {});
}

async function openFilterChip(page, label) {
  await page.getByRole('button', { name: label, exact: true }).click();
}

async function selectFilterOption(page, label, option) {
  await openFilterChip(page, label);
  await page.getByRole('option', { name: option, exact: true }).click();
  await page.waitForLoadState('networkidle').catch(() => {});
}

async function expectHeaderColumns(page) {
  const header = page.locator('thead');
  await expect(header).toContainText('Name');
  await expect(header).toContainText('Stream');
  await expect(header).toContainText('Tags');
  await expect(header).toContainText('Signal (30d)');
  await expect(header).toContainText('Last Signal');
  await expect(header).toContainText('Stage');
  await expect(header).toContainText('Ver');
  await expect(header).toContainText('Updated');
}

async function firstDataRow(page) {
  const rows = page.locator('tbody tr');
  await expect(rows.first()).toBeVisible({ timeout: 30000 });
  return rows.first();
}

async function firstWorkbookLink(page) {
  const row = await firstDataRow(page);
  const link = row.getByRole('link').first();
  await expect(link).toBeVisible({ timeout: 15000 });
  return link;
}

async function firstWorkbookLinkOrSkip(page) {
  const link = page.locator('tbody a[href*="/siem/workbooks/"]').first();
  try {
    await expect(link).toBeVisible({ timeout: 10000 });
  } catch {
    test.skip(true, 'No workbook rows are available in this QA scope. Add a seeded test workbook to run row-dependent checks.');
  }
  return link;
}

async function assertAnyVisibleText(page, values) {
  const pattern = new RegExp(values.join('|'), 'i');
  await expect(page.getByText(pattern).first()).toBeVisible({ timeout: 15000 });
}

test.describe('SIEM Workbooks', () => {
  test('workbooks-page-load-and-columns', async ({ page }) => {
    await loginAndGotoWorkbooks(page);

    await expect(page.getByText('Create and manage your Workbooks')).toBeVisible();
    await expect(page.getByText('Folders')).toBeVisible();
    await expect(page.getByPlaceholder('Search folders…')).toBeVisible();
    await expect(page.getByText('All Workbooks')).toBeVisible();
    await expectHeaderColumns(page);

    await expect(page.getByRole('button', { name: 'Open search' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Refresh data' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Export data' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Upload file' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'New' })).toBeVisible();
  });

  test('workbooks-navigation-from-siem-menu', async ({ page }) => {
    await login(page);

    await page.getByRole('button', { name: 'SIEM' }).click();
    await page.getByRole('link', { name: 'Workbooks' }).click();

    await expect(page).toHaveURL(/\/siem\/workbooks/);
    await expect(page.getByText('Create and manage your Workbooks')).toBeVisible({
      timeout: 30000,
    });
    await waitForWorkbookTable(page);
  });

  test('workbooks-folder-search', async ({ page }) => {
    await loginAndGotoWorkbooks(page);

    const folderSearch = page.getByPlaceholder('Search folders…');

    await expect(folderSearch).toBeVisible();

    await folderSearch.fill('test');
    await expect(folderSearch).toHaveValue('test');

    await folderSearch.clear();
    await expect(folderSearch).toHaveValue('');
  });

  test('workbooks-search-exact-partial-case-invalid-and-close', async ({ page }) => {
    await loginAndGotoWorkbooks(page);

    const firstLink = await firstWorkbookLinkOrSkip(page);
    const workbookName = (await firstLink.innerText()).trim();
    expect(workbookName).toBeTruthy();

    const searchBox = await openSearch(page);

    await searchBox.fill(workbookName);
    await expect(searchBox).toHaveValue(workbookName);
    await expect(page.getByRole('link', { name: workbookName, exact: true })).toBeVisible({
      timeout: 15000,
    });

    const partial = workbookName.slice(0, Math.min(4, workbookName.length));
    await searchBox.fill(partial);
    await expect(searchBox).toHaveValue(partial);
    await expect(page.getByRole('link', { name: workbookName, exact: true })).toBeVisible({
      timeout: 15000,
    });

    await searchBox.fill(workbookName.toUpperCase());
    await expect(searchBox).toHaveValue(workbookName.toUpperCase());
    await expect(page.getByRole('link', { name: workbookName, exact: true })).toBeVisible({
      timeout: 15000,
    });

    await searchBox.fill('PW-NO-SUCH-WORKBOOK-987654321');
    await expect(page.getByText(/No results found|No data available/i)).toBeVisible({
      timeout: 15000,
    });

    await clearSearch(page, searchBox);
    await page.locator('.global-search-input + button').click();
    await expect(page.getByRole('textbox', { name: SEARCH_PLACEHOLDER })).toBeHidden();
    await expect(page.getByRole('link', { name: workbookName, exact: true })).toBeVisible({
      timeout: 15000,
    });
  });

  test('workbooks-filter-chips-open-and-basic-options', async ({ page }) => {
    await loginAndGotoWorkbooks(page);

    await expect(page.getByRole('button', { name: FILTERS.stage, exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: FILTERS.tactic, exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: FILTERS.technique, exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: FILTERS.enabled, exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: FILTERS.scheduled, exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: FILTERS.stream, exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: FILTERS.tags, exact: true })).toBeVisible();

    await openFilterChip(page, FILTERS.stage);
    await expect(page.getByRole('option', { name: 'PROD', exact: true })).toBeVisible();
    await expect(page.getByRole('option', { name: 'BETA', exact: true })).toBeVisible();
    await expect(page.getByRole('option', { name: 'DEV', exact: true })).toBeVisible();
    await expect(page.getByRole('option', { name: 'TEST', exact: true })).toBeVisible();
    await page.keyboard.press('Escape');

    if (await page.getByRole('button', { name: FILTERS.severity, exact: true }).isVisible()) {
      await openFilterChip(page, FILTERS.severity);
      await expect(page.getByRole('option', { name: 'Low', exact: true })).toBeVisible();
      await expect(page.getByRole('option', { name: 'Medium', exact: true })).toBeVisible();
      await expect(page.getByRole('option', { name: 'High', exact: true })).toBeVisible();
      await expect(page.getByRole('option', { name: 'Critical', exact: true })).toBeVisible();
      await page.keyboard.press('Escape');
    }

    if (await page.getByRole('button', { name: FILTERS.score, exact: true }).isVisible()) {
      await openFilterChip(page, FILTERS.score);
      for (const score of ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']) {
        await expect(page.getByRole('option', { name: score, exact: true })).toBeVisible();
      }
      await page.keyboard.press('Escape');
    }

    await openFilterChip(page, FILTERS.enabled);
    await expect(page.getByRole('option', { name: 'Enabled', exact: true })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Disabled', exact: true })).toBeVisible();
    await page.keyboard.press('Escape');

    await openFilterChip(page, FILTERS.scheduled);
    await expect(page.getByRole('option', { name: 'Off', exact: true })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Scheduled', exact: true })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Streamed', exact: true })).toBeVisible();
  });

  test('workbooks-filter-apply-clear-and-save', async ({ page }) => {
    await loginAndGotoWorkbooks(page);

    await selectFilterOption(page, FILTERS.stage, 'Dev');
    await expect(page.getByText(/^Stage:/)).toBeVisible({ timeout: 15000 });
    await assertAnyVisibleText(page, ['Dev', 'No results found', 'No data available']);

    await page.getByRole('button', { name: 'Clear all' }).click();
    await expect(page.getByText(/^Stage:/)).toBeHidden({ timeout: 10000 });

    await selectFilterOption(page, FILTERS.stage, 'Prod');
    await page.getByText('Save as preset').click();
    await page.getByPlaceholder('Preset name…').fill('PW Workbook Stage Filter');
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByText('PW Workbook Stage Filter')).toBeVisible({
      timeout: 10000,
    });

    await page.getByRole('button', { name: 'Remove preset PW Workbook Stage Filter' }).click();
    await expect(page.getByText('PW Workbook Stage Filter')).toBeHidden({
      timeout: 10000,
    });
    await page.getByRole('button', { name: 'Clear all' }).click();
  });

  test('workbooks-stream-and-tag-multiselect-filters', async ({ page }) => {
    await loginAndGotoWorkbooks(page);

    await openFilterChip(page, FILTERS.stream);
    const streamOptions = page.getByRole('option');
    const streamCount = await streamOptions.count();
    if (streamCount === 0) {
      test.skip(true, 'No stream options returned by the QA environment.');
    }

    await streamOptions.first().click();
    if (streamCount > 1) {
      await streamOptions.nth(1).click();
    }
    await page.locator('body').click({ position: { x: 10, y: 10 } });
    await expect(page.getByText(/^Stream:/)).toBeVisible({ timeout: 15000 });

    await page.getByRole('button', { name: 'Clear all' }).click();

    await openFilterChip(page, FILTERS.tags);
    const tagOptions = page.getByRole('option');
    const tagCount = await tagOptions.count();
    if (tagCount === 0) {
      test.skip(true, 'No tag options returned by the QA environment.');
    }

    await tagOptions.first().click();
    await page.locator('body').click({ position: { x: 10, y: 10 } });
    await expect(page.getByText(/^Tags:/)).toBeVisible({ timeout: 15000 });
  });

  test('workbooks-refresh-import-and-export-modal', async ({ page }) => {
    await loginAndGotoWorkbooks(page);

    await page.getByRole('button', { name: 'Refresh data' }).click();
    await waitForWorkbookTable(page);

    await page.getByRole('button', { name: 'Upload file' }).click();
    await expect(page.getByRole('heading', { name: 'Import Workbooks' })).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText('Supported formats: CSV, JSON, XLS, XLSX')).toBeVisible();
    await expect(page.getByPlaceholder('Enter workbooks name')).toBeVisible();
    await page.getByRole('button', { name: 'Cancel' }).click();

    const exportButton = page.getByRole('button', { name: 'Export data' });
    if (!(await exportButton.isEnabled())) {
      test.skip(true, 'Export modal requires at least one workbook row in the current listing.');
    }

    await exportButton.click();

    await expect(page.getByText('File name')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Columns')).toBeVisible();
    await expect(page.getByText('Format')).toBeVisible();
    await expect(page.getByText('PDF Document')).toBeVisible();
    await expect(page.getByText('Excel Spreadsheet')).toBeVisible();
    await expect(page.getByText('CSV File')).toBeVisible();
    await expect(page.getByText('ZIP Archive')).toBeVisible();
    await page.getByRole('button', { name: 'Close' }).click();
  });

  test('workbooks-export-selected-download', async ({ page }) => {
    await loginAndGotoWorkbooks(page);
    await firstWorkbookLinkOrSkip(page);

    await page.getByLabel('Select row').first().click();
    await expect(page.getByText(/1 item selected/)).toBeVisible({ timeout: 10000 });

    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 60000 }),
      page.getByRole('button', { name: 'Export data' }).click(),
    ]);

    expect(download.suggestedFilename()).toBeTruthy();
  });

  test('workbooks-row-selection-and-bulk-actions', async ({ page }) => {
    await loginAndGotoWorkbooks(page);
    await firstWorkbookLinkOrSkip(page);

    const rowCheckboxes = page.getByLabel('Select row');
    await expect(rowCheckboxes.first()).toBeVisible({ timeout: 15000 });

    await rowCheckboxes.first().click();
    await expect(page.getByText(/1 item selected/)).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: 'Delete' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Enable' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Disable' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Move' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Export data' })).toBeVisible();

    if ((await rowCheckboxes.count()) > 1) {
      await rowCheckboxes.nth(1).click();
      await expect(page.getByText(/2 items selected/)).toBeVisible({ timeout: 10000 });
    }

    await page.getByLabel('Select all').click();
    await expect(page.getByText(/item[s]? selected/)).toBeVisible({ timeout: 10000 });
  });

  test('workbooks-open-details-and-version-panel', async ({ page }) => {
    await loginAndGotoWorkbooks(page);

    const link = await firstWorkbookLinkOrSkip(page);
    const workbookName = (await link.innerText()).trim();
    await link.click();

    await expect(page).toHaveURL(/\/siem\/workbooks\/[^/]+/);
    await expect(page.getByRole('heading', { name: workbookName })).toBeVisible({
      timeout: 30000,
    });
    await expect(page.getByRole('button', { name: 'Add Block' })).toBeVisible({
      timeout: 30000,
    });

    await page.getByRole('button', { name: 'Settings' }).click();

    await expect(page.getByText('WORKBOOK')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Name')).toBeVisible();
    await expect(page.getByText('Stage')).toBeVisible();
    await expect(page.getByText('Versions')).toBeVisible();
  });
});