import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: './tests',
	snapshotPathTemplate: '{testDir}/{testFilePath}-snapshots/{arg}{ext}',
	workers: 1, // Run tests sequentially to avoid session conflicts
	webServer: [
		{
			command:
				'APP_URL=http://localhost:3333 FRONT_END_URL=http://localhost:4173 USE_MEMORY_DB=true PORT=3333 yarn workspace MemoryFlashServer start:prod',
			port: 3333,
			reuseExistingServer: !process.env.CI,
		},
		{
			command: 'VITE_API_BASE_URL=http://localhost:3333 vite --host --port 4173',
			port: 4173,
			reuseExistingServer: !process.env.CI,
		},
	],
	use: {
		baseURL: 'http://localhost:4173',
		screenshot: 'only-on-failure',
		// Normalize rendering differences between macOS and Linux in CI runs.
		launchOptions: {
			args: [
				'--force-device-scale-factor=1',
				'--disable-font-subpixel-positioning',
				'--disable-lcd-text',
			],
		},
	},
	reporter: [['html', { open: 'never' }]],
});
