# Bloo QA — Dashboard Tests

Automated Playwright test suite for the Bloo SIEM Dashboard page (under SIEM menu).

## Setup

### Prerequisites
- Node.js >= 18
- npm or yarn

### Installation

```bash
cd /home/yohanns/Desktop/bloo/QA
npm install
```

This installs `@playwright/test` v1.60.0 and its dependencies.

## Running Tests

### Run all tests
```bash
npx playwright test
```

### Run a single test file
```bash
npx playwright test siem-dashboard.spec.js
```
### Run tests in headed mode (see browser)
```bash
npx playwright test --headed
```

### Run with debug mode
```bash
PWDEBUG=1 npx playwright test siem-dashboard.spec.js
```

### Run tests in specific browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Test Files
Core Tests (Production)
All dashboard tests are consolidated into a single Playwright spec:
* **siem-dashboard.spec.js** — Contains all Dashboard test cases, including:
- **dashboard-page-load** — Verifies the dashboard page loads and displays the correct heading.
- **dashboard-export-modal** — Tests exporting the dashboard list (no row selected) as PDF via modal.
- **dashboard-export-selected** — Tests exporting a selected dashboard row as tar.gz archive.
- **dashboard-search-sme** — Tests searching for "SME-TEST" dashboard in the table.
- **dashboard-search-identity** — Tests searching for "Identity and Access Monitoring" dashboard.
- **dashboard-type-filter** — Tests opening and interacting with the Type filter.
- **dashboard-author-filter** — Tests opening and interacting with the Author filter.
- **dashboard-useraccess-filter** — Tests opening and interacting with the User Access filter.
- **dashboard-import-modal** — Tests opening the import modal and verifying supported file formats.
- **dashboard-misc** — Comprehensive integration test covering dark/light mode toggle, data refresh, and user interactions.
- **dashboard-create-delete** — Tests the dashboard lifecycle by creating a dashboard, adding and removing widgets, saving the dashboard, verifying it appears in the list, deleting it, and refreshing the dashboard table to confirm cleanup.
- **dashboard-search-and-filter** — Comprehensive search and filter validation including exact, partial, case-insensitive, empty-result searches, filter combinations, filter reset, and filter persistence.

## Configuration

### playwright.config.ts
- **timeout**: 60s per test
- **navigationTimeout**: 60s for page.goto() and navigations
- **actionTimeout**: 15s for clicks, fills, etc.

Adjust timeouts in `playwright.config.ts` if tests run on slower networks or servers.

## Test Patterns & Best Practices

### Selectors
- Prefer role-based selectors: `getByRole('button', { name: 'Export data' })`
- Use accessible labels: `getByLabel('Select row')`
- Avoid brittle nth() or generic div filters when possible

### Waits
- Always wait for page load after navigation: `await page.waitForLoadState('networkidle')`
- Poll for enabled state rather than relying on single selectors:
  ```javascript
  let enabled = false;
  for (let i = 0; i < 30; i++) {
    if (await exportButton.isEnabled()) {
      enabled = true;
      break;
    }
    await page.waitForTimeout(1000);
  }
  expect(enabled).toBeTruthy();
  ```

### Modal Handling
- Wait for a visible child element (heading, button) inside the modal.
- Use ancestor XPath to scope the dialog if needed:
  ```javascript
  const exportDialog = dialogHeading.locator('xpath=ancestor::div[@role="dialog"]').first();
  ```

### Download Handling
- Use `Promise.all()` to wait for download event and click in parallel:
  ```javascript
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 60000 }),
    exportDialog.getByRole('button', { name: /^Export$/ }).click()
  ]);
  ```

### Error Handling
- Use try/catch for optional UI flows (e.g., modal may or may not appear):
  ```javascript
  try {
    await dialogHeading.waitFor({ state: 'visible', timeout: 5000 });
    // interact with modal
  } catch {
    // fallback: direct download or alternative flow
  }
  ```

## Credentials

Tests use a shared test account:
- **Email**: `yohann.shroff@bloo.io`
- **Password**: `Doctorwho@6c`

**Note**: Hardcoded credentials in tests are acceptable for QA environments only. For production, use environment variables or a secrets manager.

## CI/CD Integration

To run tests in a CI pipeline (e.g., GitHub Actions, GitLab CI):

```yaml
- name: Run Playwright tests
  run: npm install && npx playwright test
```

Ensure Node.js >= 18 is available in the CI environment.

## Troubleshooting

### Test timeouts
- Increase `timeout` in `playwright.config.ts`.
- Check if the Bloo server is running and responsive.
- Run with `PWDEBUG=1` to inspect element states in real-time.

### Element not found
- Verify the selector matches the current DOM (inspect with DevTools or Playwright Inspector).
- Use `getByRole()` and `getByLabel()` for more robust selectors.

### Login failures
- Ensure the test account credentials are correct and the user is not locked out.
- Check if the login page layout has changed (may require selector updates).

### Downloads not captured
- Ensure `waitForEvent('download')` is set up *before* triggering the download.
- Use `Promise.all()` to wait and click simultaneously.

## Maintenance

### Adding new tests
1. Add the new test inside siem-dashboard.spec.js.
2. Follow the existing pattern:
- Login
- Navigate
- Interact
- Assert
- Cleanup any created test data
3. Use role-based and accessible selectors whenever possible.
4. Prefer scoped locators (filter({ has: ... })) over brittle CSS chains.
5. Update this README with:
- Test purpose
- Main workflow
- Any special selector or timing considerations
6. Ensure tests leave the environment in the same state they found it (delete created dashboards, reports, etc.).

### Updating selectors
- If the app UI changes, update selectors in affected tests.
- Prefer role/label selectors over CSS/XPath where possible.
- Test the new selector in Playwright Inspector before committing.

### Running locally vs. CI
- Local: `npx playwright test` (uses default browser)
- CI: Specify project and use headless mode: `npx playwright test --project=chromium`

## License

Internal QA suite for Bloo. Not for external distribution.
