import { test, expect } from './helpers';

async function uiLogin(page: any, email: string, password: string) {
	await page.goto('/auth/login');
	await page.fill('#email', email);
	await page.fill('#password', password);

	// Click login and wait for the request to complete
	const [response] = await Promise.all([
		page.waitForResponse((response) => response.url().includes('/auth/log-in')),
		page.click('button:has-text("Login")'),
	]);

	if (response.status() !== 200) {
		const responseText = await response.text();
		throw new Error(`Login failed with status ${response.status()}: ${responseText}`);
	}

	// Wait for navigation away from login page
	await page.waitForURL((url) => !url.toString().includes('/auth/login'), { timeout: 5000 });
}

test('end-to-end: login, seed pop course, open first deck, study renders', async ({ page }) => {
	// Seed the data first (this creates the user account)
	const seedResp = await page.request.post('http://localhost:3333/test/seed');
	expect(seedResp.ok()).toBeTruthy();
	const seedJson = await seedResp.json();
	const firstDeckId = seedJson.decks?.[0]?._id;
	expect(firstDeckId).toBeTruthy();

	// Now login with the created user
	await uiLogin(page, 't@example.com', 'Testing123!');

	// Navigate to the study page
	await page.goto(`/study/${firstDeckId}`);

	// Wait for the study page to load and look for the study interface
	await expect(page.getByText(/tooLongTime:/)).toBeVisible({ timeout: 10000 });

	// Take a screenshot of the study screen
	const studyScreenContent = page.locator('#root');
	await studyScreenContent.waitFor();
	await expect(studyScreenContent).toHaveScreenshot('study-screen-end-to-end.png');

	console.log('✅ Test passed: Study screen is loaded and showing stats');
});
