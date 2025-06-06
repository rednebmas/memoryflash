import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  webServer: {
    command: 'vite --host --port 4173',
    port: 4173,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: 'http://localhost:4173',
    screenshot: 'only-on-failure',
    snapshotPathTemplate: '{testDir}/{testFilePath}-snapshots/{arg}{ext}',
  },
  reporter: [['html', { open: 'never' }]],
});
