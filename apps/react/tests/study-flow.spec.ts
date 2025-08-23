import { test, expect, seedTestData, uiLogin, stubMathRandom } from './helpers';

test('end-to-end: login, seed pop course, open first deck, study renders', async ({ page }) => {
	await stubMathRandom(page);

	const seedJson = await seedTestData(page);
	const firstDeckId = seedJson.decks?.[0]?._id;
	expect(firstDeckId).toBeTruthy();

	await uiLogin(page, 't@example.com', 'Testing123!');

	await page.goto(`/study/${firstDeckId}`);

	await expect(page.getByText(/Sheet Music w\/ Chords/)).toBeVisible({ timeout: 10000 });

	const studyScreenContent = page.locator('#root');
	await studyScreenContent.waitFor();
	await expect(studyScreenContent).toHaveScreenshot('study-screen-end-to-end.png');
});
