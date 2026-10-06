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

const openRepeats = async (page: Page) => {
	await openDeckSettings(page);
	return page.getByLabel('After a miss, play it right');
};

test('deck settings keep how many right plays in a row a missed card needs', async ({ page }) => {
	await initDeterministicEnv(page);
	const seed = await seedTestData(page);
	await uiLogin(page, 't@example.com', 'Testing123!');
	await page.goto(`/study/${seed.decks?.[0]?._id}`);

	const repeats = await openRepeats(page);
	await expect(repeats).toHaveValue('1');
	await expect(page.locator('[id^=headlessui-dialog-panel]')).toHaveScreenshot(
		'deck-settings-miss-repeats.png',
		screenshotOpts,
	);

	await repeats.selectOption({ label: '2 times in a row' });
	await page.waitForResponse((r) => r.url().includes('/scheduler'));
	await page.reload();
	await expect(await openRepeats(page)).toHaveValue('2');

	await page.getByText('Recall', { exact: true }).click();
	await expect(page.getByLabel('After a miss, play it right')).toHaveValue('2');
});
