import { Page } from '@playwright/test';
import {
	test,
	expect,
	seedTestData,
	uiLogin,
	initDeterministicEnv,
	screenshotOpts,
} from './helpers';

const metronome = (page: Page) => page.locator('div[role=button].bg-blue-500');
const status = (page: Page) => page.locator('p.caption', { hasText: /Metronome only|Rhythm mode/ });

test('study screen grades timing as soon as the metronome starts', async ({ page }) => {
	await initDeterministicEnv(page);
	const seed = await seedTestData(page);
	await uiLogin(page, 't@example.com', 'Testing123!');
	await page.goto(`/study/${seed.decks?.[0]?._id}`);
	await expect(page.getByText(/Sheet Music w\/ Chords/)).toBeVisible({ timeout: 10000 });

	await expect(status(page)).toHaveCount(0);
	await metronome(page).click();
	await expect(status(page)).toHaveText(/Rhythm mode · \d+ bpm · your first chord sets beat one/);
	await expect(status(page).locator('..')).toHaveScreenshot(
		'rhythm-status-waiting.png',
		screenshotOpts,
	);
});
