import { Page } from '@playwright/test';
import {
	test,
	expect,
	seedTestData,
	uiLogin,
	initDeterministicEnv,
	screenshotOpts,
} from './helpers';
import { playCurrentCard, playNextBeat, playWrongNote } from './helpers/playCard';

const restartPill = (page: Page) => page.getByText('Restart card', { exact: true });
const partIndex = (page: Page) =>
	page.evaluate(() => (window as any).store.getState().scheduler.multiPartCardIndex);

test('a missed card can be restarted from its first chord', async ({ page }) => {
	await initDeterministicEnv(page);
	const seed = await seedTestData(page);
	await uiLogin(page, 't@example.com', 'Testing123!');
	await page.goto(`/study/${seed.decks?.[0]?._id}`);
	await expect(page.getByText(/Sheet Music w\/ Chords/)).toBeVisible({ timeout: 10000 });

	await expect(restartPill(page)).toHaveCount(0);
	await playNextBeat(page);
	await playWrongNote(page);
	await expect(restartPill(page)).toBeVisible();
	await expect(page.locator('#root')).toHaveScreenshot('restart-card.png', screenshotOpts);
	expect(await partIndex(page)).toBeGreaterThan(0);

	await restartPill(page).click();
	expect(await partIndex(page)).toBe(0);
	await playCurrentCard(page);
	await expect(page.getByText('Missed · play it right 1 more time')).toBeVisible();
	await expect(restartPill(page)).toHaveCount(0);
});
