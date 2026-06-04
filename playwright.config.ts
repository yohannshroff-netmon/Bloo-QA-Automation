import { defineConfig } from '@playwright/test';
 
export default defineConfig({
  timeout: 60000,           // per-test timeout (60s)
  use: {
    navigationTimeout: 60000, // for page.goto / navigations
    actionTimeout: 15000,     // for clicks, fills, etc.
  },
});