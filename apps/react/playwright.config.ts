import { defineConfig } from '@playwright/test';

const deviceScaleFactor = ['linux', 'darwin'].includes(process.platform) ? 2 : 1;

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
		deviceScaleFactor,
	},
	reporter: [['html', { open: 'never' }]],
});
