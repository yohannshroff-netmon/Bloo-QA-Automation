# Bloo QA — Automation Suite

Automated Playwright test suite for the Bloo platform, focusing on SIEM Dashboards and Workbooks.

## Setup

### Prerequisites
- Node.js >= 18
- npm or yarn

### Installation

```bash
cd /home/yohanns/Desktop/bloo/QA
npm install
```

### Environment Configuration
Create a `.env` file in the root of the `QA/` directory with the following variables:

```env
BLOOTEST_EMAIL=your-email@bloo.io
BLOOTEST_PASSWORD=your-password
URL=https://bloo-qa.dnifuat.com
```

## Running Tests

### Run all tests
```bash
npx playwright test
```

### Run SIEM Dashboard tests
```bash
npx playwright test siem-dashboard.spec.js
```

### Run SIEM Workbook tests
```bash
npx playwright test siem-workbook.spec.js
```

## Test Case Descriptions

### SIEM Dashboards (`siem-dashboard.spec.js`)

| Test Name | Description |
|-----------|-------------|
| `dashboard-page-load` | Verifies the dashboard listing page loads correctly and displays the "Manage and view your security dashboards" heading. |
| `dashboard-author-filter` | Checks that the **Author** filter chip opens a popover with the "Save Filter" action visible. |
| `dashboard-type-filter` | Checks that the **Type** (Public/Private) filter chip opens correctly. |
| `dashboard-useraccess-filter` | Checks that the **User Access** filter chip opens correctly. |
| `dashboard-search-identity` | Verifies that searching for "Identity and Access Monitoring" returns the correct result. |
| `dashboard-search-sme` | Verifies that searching for "SME-TEST" returns the correct result. |
| `dashboard-search-and-filter` | Comprehensive test for search functionality (exact, partial, case-insensitive) and filter application/clearing. |
| `dashboard-open-verify` | Selects a dashboard from the list, navigates to its detailed view, and verifies the URL and heading. |
| `dashboard-create-delete` | **Lifecycle Test**: Creates a new temporary dashboard, adds a widget, saves it, and then deletes it from the listing. |
| `dashboard-export-modal` | Verifies that the **Export data** button opens a modal containing file naming and format options. |
| `dashboard-export-selected` | Selects a row and verifies the export flow for a specific selection. |
| `dashboard-mode-signout` | Tests UI settings like **Dark/Light Mode** toggles, data refresh, and user **Sign out**. |

### SIEM Workbooks (`siem-workbook.spec.js`)

| Test Name | Description |
|-----------|-------------|
| `workbooks-page-load-and-columns` | Verifies the page loads and all 8+ header columns (Name, Stream, Stage, etc.) are present along with global action buttons. |
| `workbooks-navigation-from-siem-menu` | Validates the navigation flow from the **SIEM** sidebar menu to the **Workbooks** page. |
| `workbooks-folder-search` | Tests the folder search input in the left-hand organizational sidebar. |
| `workbooks-search-exact-partial-case-invalid-and-close` | Tests global workbook search logic, including exact matching, partial strings, and case-insensitivity. |
| `workbooks-filter-chips-open-and-basic-options` | Ensures filter chips (Stage, Enabled, etc.) open popovers with valid deployment and status options. |
| `workbooks-multi-filter-stage-and-stream` | **Robustness Test**: Applies a combination of filters (e.g., Stage: Prod + Stream: firewall) and verifies the resulting UI state. |
| `workbooks-refresh-import-and-export-modal` | Tests the **Refresh data** action and triggers the **Import** and **Export** UI modals. |
| `workbooks-export-selected-download` | Selects a workbook row and verifies that clicking Export triggers a browser download event. |
| `workbooks-row-selection-and-bulk-actions` | Selects multiple rows and verifies the visibility of bulk actions: **Delete, Enable, Disable, and Move**. |
| `workbooks-open-details-and-version-panel` | Navigates into a workbook, verifies the heading, and opens the **Settings/Versions** drawer. |

## Documentation
- **GEMINI.md** — Project-wide context, conventions, and module index.
- **SIEM-WORKBOOKS-CONTEXT.md** — Detailed architectural and functional mapping for the Workbooks module.

## Configuration (`playwright.config.ts`)
- **Global Timeout**: 60s per test.
- **Navigation Timeout**: 60s (handles slow environment redirects).
- **Action Timeout**: 15s (standard for clicks and fills).
- **Automation**: Uses `dotenv` to load credentials from `.env`.

## Troubleshooting

- **Tests skipping?** We have removed manual skips. Tests will now fail with descriptive messages if the environment is missing data (e.g., "No stream options returned").
- **Strict Mode violations?** If a test fails with "resolved to 2 elements", use `exact: true` in the locator or scope it using a parent element.
- **Empty list?** Ensure your tenant has at least one workbook created for functional tests to find data.

## Maintenance

- **Adding tests**: Add to the relevant `.spec.js` file and update this table.
- **Selectors**: Prefer `getByRole`, `getByLabel`, or `getByText` for accessibility-first, robust testing.
- **Cleanup**: Always ensure lifecycle tests (like `create-delete`) remove their temporary data even on failure.

---
*Internal QA suite for Bloo. Not for external distribution.*
