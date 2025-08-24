import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: './tests',
	snapshotPathTemplate: '{testDir}/{testFilePath}-snapshots/{platform}/{arg}{ext}',
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
		viewport: { width: 1280, height: 800 },
		deviceScaleFactor: 1,
	},
	reporter: [['html', { open: 'never' }]],
});
