import { Page } from '@playwright/test';
import {
	test,
	expect,
	seedTestData,
	uiLogin,
	initDeterministicEnv,
	screenshotOpts,
} from './helpers';

const openDeckSettings = async (page: Page) => {
	await expect(page.getByText(/Sheet Music w\/ Chords/)).toBeVisible({ timeout: 10000 });
	await page.locator('div.cursor-pointer:has(svg path[d^="M9.594"])').first().click();
	return page.getByLabel('Repeat a missed card');
};

test('deck settings keep how often a missed card repeats', async ({ page }) => {
	await initDeterministicEnv(page);
	const seed = await seedTestData(page);
	await uiLogin(page, 't@example.com', 'Testing123!');
	await page.goto(`/study/${seed.decks?.[0]?._id}`);

	const repeats = await openDeckSettings(page);
	await expect(repeats).toHaveValue('1');
	await expect(page.locator('[id^=headlessui-dialog-panel]')).toHaveScreenshot(
		'deck-settings-miss-repeats.png',
		screenshotOpts,
	);

	await repeats.selectOption({ label: 'Twice' });
	await page.waitForResponse((r) => r.url().includes('/scheduler'));
	await page.reload();
	await expect(await openDeckSettings(page)).toHaveValue('2');

	await page.getByText('Recall', { exact: true }).click();
	await expect(page.getByLabel('Repeat a missed card')).toHaveCount(0);
});
