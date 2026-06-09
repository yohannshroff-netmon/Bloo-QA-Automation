# QA Workspace Context

## Core Modules

### SIEM Workbooks
- **Context File:** [SIEM-WORKBOOKS-CONTEXT.md](./SIEM-WORKBOOKS-CONTEXT.md)
- **Tests:** `siem-workbook.spec.js`
- **Frontend Code:** `../bloo-command/src/pages/SIEM/Workbooks/`

### SIEM Dashboards
- **Tests:** `siem-dashboard.spec.js`
- **Key Features:** Author filters, Type filters (Public/Private), Export functionality (tar.gz), Widget management.

## Project Conventions
- **Base URL:** `https://bloo-qa.dnifuat.com`
- **Credentials:** Managed via `.env` file (Variables: `BLOOTEST_EMAIL`, `BLOOTEST_PASSWORD`)
- **Testing Tool:** Playwright
- **Page Load Strategy:** Prefer `domcontentloaded` or `networkidle` with appropriate timeouts (30s-60s) for slow QA environments.
