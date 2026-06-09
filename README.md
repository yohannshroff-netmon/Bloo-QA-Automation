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
### Core Tests (Production)
- **siem-dashboard.spec.js** — Comprehensive suite for SIEM Dashboards, covering creation, deletion, filtering, and export.
- **siem-workbook.spec.js** — Comprehensive suite for SIEM Workbooks, covering listing, search, folder management, and bulk actions.

## Documentation
- **GEMINI.md** — Project-wide context, conventions, and module index.
- **SIEM-WORKBOOKS-CONTEXT.md** — Detailed architectural and functional mapping for the Workbooks module.

## Configuration

### playwright.config.ts
- **timeout**: 60s per test
- **navigationTimeout**: 60s for page.goto() and navigations
- **actionTimeout**: 15s for clicks, fills, etc.
- **Environment Variables**: Loads variables from `.env` using `dotenv`.

## Credentials

Tests use environment variables for authentication. Create a `.env` file in the root directory:

```env
BLOOTEST_EMAIL=your-email@bloo.io
BLOOTEST_PASSWORD=your-password
```

**Note**: The `.env` file is excluded from version control via `.gitignore`.

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
