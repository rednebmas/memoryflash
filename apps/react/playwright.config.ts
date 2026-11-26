import { defineConfig } from '@playwright/test';
import { API_PORT, API_URL, WEB_PORT, WEB_URL } from './tests/helpers/ports';

export default defineConfig({
	testDir: './tests',
	snapshotPathTemplate: '{testDir}/{testFilePath}-snapshots/{arg}{ext}',
	workers: 1, // Run tests sequentially to avoid session conflicts
	webServer: [
		{
			command: `APP_URL=${API_URL} FRONT_END_URL=${WEB_URL} USE_MEMORY_DB=true PORT=${API_PORT} yarn workspace MemoryFlashServer start:prod`,
			port: API_PORT,
			reuseExistingServer: false,
		},
		{
			command: `VITE_API_BASE_URL=${API_URL} vite --host --port ${WEB_PORT} --strictPort`,
			port: WEB_PORT,
			reuseExistingServer: false,
		},
	],
	use: {
		baseURL: WEB_URL,
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
