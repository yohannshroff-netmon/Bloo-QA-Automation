# SIEM Workbooks Context

This document provides a comprehensive overview of the SIEM Workbooks module, mapping its frontend architecture, functional features, and testing patterns.

## 1. Architecture Overview

### Key Frontend Components (bloo-command)
- **Main Listing:** `src/pages/SIEM/Workbooks/WorkbookList.tsx`
  - Handles the primary table view, search, filtering, and bulk actions.
- **Workbook View (Canvas):** `src/pages/SIEM/Workbooks/WorkbookView.tsx`
  - The main editor/view interface for individual workbooks.
- **Block System:**
  - `BlockRenderer.tsx`: Orchestrates the display of various content blocks.
  - `DQLBlock.tsx`: Handles Data Query Language (DQL) logic.
  - `SignalBlock.tsx`: Manages signal-related data and visualization.
  - `SearchBlock.tsx`: Provides search functionality within a workbook.
  - `NotificationBlock.tsx`: Handles alerting and notifications.
  - `OutlierBlock.tsx`: Detects and displays anomalies.
- **Organization & Sidebar:**
  - `FolderList.tsx`: Manages the workbook folder structure in the left sidebar.
  - `DirectoryList.tsx`: Displays workbooks within a selected folder.
- **Configuration & Settings:**
  - `WorkbookPanel.tsx`: Sidebar for workbook metadata, versioning, and settings.
  - `workbookForm.ts`: Form validation and logic for creating/editing workbooks.

## 2. Functional Summary

Users interact with Workbooks to organize, analyze, and visualize security data. Key features include:
- **CRUD Operations:** Create, Read, Update, and Delete workbooks.
- **Folder Management:** Organize workbooks into hierarchical folders.
- **Advanced Filtering:** Filter the workbook list by Stage (PROD, BETA, DEV, TEST), Tactic, Technique, Severity, Score, Enabled status, and Schedule.
- **Blocks:** Modular building blocks for workbooks (DQL, Signals, Outliers, etc.).
- **Bulk Actions:** Perform actions (Enable, Disable, Delete, Move, Export) on multiple workbooks simultaneously.
- **Versioning:** Track and manage different versions of a workbook.
- **Import/Export:** Support for CSV, JSON, XLS, XLSX formats.

## 3. Testing Strategy (Playwright)

The `QA/siem-workbook.spec.js` script covers the following critical paths:
- **Navigation:** Verifies entry from the SIEM menu and direct URL access.
- **Listing & UI Integrity:** Checks headers, primary action buttons, and table responsiveness.
- **Search & Folders:** Validates folder search in the sidebar and global workbook search (exact, partial, and case-insensitive).
- **Filter Logic:** 
  - Verifies chip visibility and available options.
  - Tests filter application, clearing, and "Save as Preset" functionality.
- **Bulk Operations:** Tests row selection and the visibility of bulk action buttons (Delete, Enable, Disable, etc.).
- **Import/Export Flow:** Validates the export modal options and triggers a download. Tests the import modal UI.
- **Workbook Details:** Navigates into a workbook and verifies the presence of the "Add Block" button and the Settings/Version panel.

## 4. UI Reference

### Main Table Columns
- **Name:** Clickable link to the workbook details.
- **Stream:** Associated data stream.
- **Tags:** Metadata tags.
- **Signal (30d):** Signal count over the last 30 days.
- **Last Signal:** Timestamp of the most recent signal.
- **Stage:** Current deployment stage (DEV, TEST, BETA, PROD).
- **Ver:** Current version number.
- **Updated:** Last modification timestamp.

### Global Actions
- **Open Search:** Toggle the search input.
- **Refresh Data:** Reload the workbook list.
- **Export Data:** Open the export configuration modal.
- **Upload File:** Open the import modal.
- **New:** Create a new workbook.

### Filters
| Filter | Options |
| --- | --- |
| **Stage** | PROD, BETA, DEV, TEST |
| **Enabled** | Enabled, Disabled |
| **Scheduled** | Off, Scheduled, Streamed |
| **Severity** | Low, Medium, High, Critical |
| **Score** | 1 to 10 |

## 5. Technical Details

- **Base URL (QA):** `https://bloo-qa.dnifuat.com`
- **Route:** `/#/<org>/<tenant>/siem/workbooks`
- **Supported Formats:**
  - **Import:** CSV, JSON, XLS, XLSX.
  - **Export:** PDF, Excel, CSV, ZIP.
- **Wait States:** Tests wait for `networkidle` and specific element visibility (e.g., `tbody`, `thead`) to ensure robust execution on dynamic loads.
