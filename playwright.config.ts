import { defineConfig } from '@playwright/test';
import 'dotenv/config';
 
export default defineConfig({
  timeout: 60000,           // per-test timeout (60s)
  use: {
    navigationTimeout: 60000, // for page.goto / navigations
    actionTimeout: 15000,     // for clicks, fills, etc.
  },
});