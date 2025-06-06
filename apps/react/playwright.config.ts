import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  snapshotPathTemplate: '{testDir}/{testFilePath}-snapshots/{arg}{ext}',
  webServer: {
    command: 'vite --host --port 4173',
    port: 4173,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: 'http://localhost:4173',
    screenshot: 'only-on-failure',
  },
  reporter: [['html', { open: 'never' }]],
});
