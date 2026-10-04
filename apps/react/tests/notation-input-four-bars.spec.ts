import { test, expect, screenshotOpts, runRecorderEvents } from './helpers';

test('NotationInputScreen fits four bars in the preview card', async ({ page }) => {
	await page.setViewportSize({ width: 1366, height: 992 });
	await page.goto('/tests/notation-input-screen-test.html');
	const output = page.locator('#root');
	await output.waitFor();

	await page.locator('input[type=number]').first().fill('4');
	await page.getByRole('button', { name: 'h', exact: true }).click();
	await runRecorderEvents(page, undefined, [[60], [64], [67], [72], [71], [67], [65], [62]]);

	await expect(output).toHaveScreenshot('notation-input-four-bars.png', screenshotOpts);
});
