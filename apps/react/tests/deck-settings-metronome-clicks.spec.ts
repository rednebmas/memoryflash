import { Page } from '@playwright/test';
import {
	openDeckSettings,
	test,
	expect,
	seedTestData,
	uiLogin,
	initDeterministicEnv,
	screenshotOpts,
} from './helpers';

const clickToggles = async (page: Page) => {
	const panel = await openDeckSettings(page);
	return panel.getByText('Metronome clicks on').locator('..');
};

test('deck settings choose which beats the metronome clicks on', async ({ page }) => {
	await initDeterministicEnv(page);
	const seed = await seedTestData(page);
	await uiLogin(page, 't@example.com', 'Testing123!');
	await page.goto(`/study/${seed.decks?.[0]?._id}`);

	const toggles = await clickToggles(page);
	await expect(toggles.locator('button')).toHaveText(['1', '&', '2', '&', '3', '&', '4', '&']);
	for (const i of [2, 6, 1]) {
		await toggles.locator('button').nth(i).click();
		await page.waitForResponse((r) => r.url().includes('/rhythm'));
	}
	await page.reload();
	const reloaded = await clickToggles(page);
	await expect(reloaded.locator('button.bg-gray-900')).toHaveText(['1', '&', '3']);
	await expect(reloaded).toHaveScreenshot('metronome-clicks.png', screenshotOpts);
});
