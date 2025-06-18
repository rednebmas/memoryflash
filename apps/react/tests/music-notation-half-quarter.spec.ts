import { test, expect, screenshotOpts } from './helpers';

test('MusicNotation half and quarter notes screenshot', async ({ page }) => {
	await page.goto('/tests/music-notation-half-quarter-test.html');
	const output = page.locator('#output');
	await output.waitFor();
	await expect(output).toHaveScreenshot('music-notation-half-quarter.png', screenshotOpts);
});
