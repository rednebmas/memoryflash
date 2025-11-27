import { chromium } from 'playwright';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const OUTPUT_PATH =
	process.env.OUTPUT_PATH || new URL('../.auth-state.json', import.meta.url).pathname;
const TEST_EMAIL = process.env.TEST_EMAIL || 'test@test.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'Testing1!';

async function generateAuthState() {
	console.log('Launching browser...');
	const browser = await chromium.launch();
	const context = await browser.newContext();
	const page = await context.newPage();

	console.log(`Logging in as ${TEST_EMAIL}...`);
	await page.goto(`${BASE_URL}/auth/login`);
	await page.fill('#email', TEST_EMAIL);
	await page.fill('#password', TEST_PASSWORD);

	const [response] = await Promise.all([
		page.waitForResponse((r) => r.url().includes('/auth/log-in')),
		page.click('button:has-text("Login")'),
	]);

	if (response.status() !== 200) {
		throw new Error(`Login failed: ${await response.text()}`);
	}

	await page.waitForURL((url) => !url.toString().includes('/auth/login'), { timeout: 5000 });
	console.log('Login successful');

	console.log(`Saving storage state to ${OUTPUT_PATH}...`);
	await context.storageState({ path: OUTPUT_PATH });

	await browser.close();
	console.log('Auth state generated successfully!');
}

generateAuthState().catch((err) => {
	console.error('Failed to generate auth state:', err);
	process.exit(1);
});
