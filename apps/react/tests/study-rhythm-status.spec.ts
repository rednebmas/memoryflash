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

test('study screen says whether the metronome is grading timing', async ({ page }) => {
	await initDeterministicEnv(page);
	const seed = await seedTestData(page);
	await uiLogin(page, 't@example.com', 'Testing123!');
	await page.goto(`/study/${seed.decks?.[0]?._id}`);
	await expect(page.getByText(/Sheet Music w\/ Chords/)).toBeVisible({ timeout: 10000 });

	await metronome(page).click();
	await expect(status(page)).toHaveText(/Metronome only · timing isn't graded/);
	await metronome(page).click();
	await expect(status(page)).toHaveCount(0);

	await page.locator('div.cursor-pointer:has(svg path[d^="M9.594"])').first().click();
	await page.getByText('Play in time with the metronome').click();
	await page.getByRole('button', { name: 'Close' }).click();
	await expect(status(page)).toHaveText(/start the metronome to be graded/);

	await metronome(page).click();
	await expect(status(page)).toHaveText(/your first chord sets beat one/);
	await expect(status(page).locator('..')).toHaveScreenshot(
		'rhythm-status-waiting.png',
		screenshotOpts,
	);
});
