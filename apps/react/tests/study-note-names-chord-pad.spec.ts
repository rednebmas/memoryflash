import {
	test,
	expect,
	seedTestData,
	uiLogin,
	initDeterministicEnv,
	screenshotOpts,
} from './helpers';

test('chord cards can be spelled on a phone by tapping note names', async ({ page }) => {
	await page.setViewportSize({ width: 402, height: 714 });
	await initDeterministicEnv(page);
	const seed = await seedTestData(page);
	await uiLogin(page, 't@example.com', 'Testing123!');
	await page.goto(`/study/${seed.decks?.[0]?._id}`);
	await page.getByText('Note names', { exact: true }).click();
	await page.getByRole('button', { name: 'C♯/D♭', exact: true }).dispatchEvent('click');
	await page.getByRole('button', { name: 'F', exact: true }).dispatchEvent('click');
	await expect(page.getByRole('button', { name: 'F', exact: true })).toHaveClass(/bg-red-500/);
	await page.waitForTimeout(300);
	await expect(page.locator('#root')).toHaveScreenshot(
		'note-names-chord-pad.png',
		screenshotOpts,
	);
});
