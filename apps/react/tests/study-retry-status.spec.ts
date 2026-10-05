import { Page } from '@playwright/test';
import {
	test,
	expect,
	seedTestData,
	uiLogin,
	initDeterministicEnv,
	screenshotOpts,
} from './helpers';
import { playCurrentCard, playWrongNote } from './helpers/playCard';

const retryStatus = (page: Page) => page.getByText(/^Missed · play it right/);

test('study screen says how many right plays a missed card still needs', async ({ page }) => {
	await initDeterministicEnv(page);
	const seed = await seedTestData(page);
	await uiLogin(page, 't@example.com', 'Testing123!');
	await page.goto(`/study/${seed.decks?.[0]?._id}`);
	await expect(page.getByText(/Sheet Music w\/ Chords/)).toBeVisible({ timeout: 10000 });

	await expect(retryStatus(page)).toHaveCount(0);
	await playWrongNote(page);
	await expect(retryStatus(page)).toHaveText('Missed · play it right 1 more time');
	await playCurrentCard(page);
	await expect(retryStatus(page)).toHaveText('Missed · play it right 1 more time');
	await expect(page.locator('#root')).toHaveScreenshot('retry-status.png', screenshotOpts);
	await playCurrentCard(page);
	await expect(retryStatus(page)).toHaveCount(0);
});
