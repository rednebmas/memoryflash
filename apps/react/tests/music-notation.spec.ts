import { test, expect, screenshotOpts } from './helpers';

test('MusicNotation component screenshot', async ({ page }) => {
	await page.goto('/tests/music-notation-test.html');
	const output = page.locator('#output');
	await output.waitFor();
	await expect(output).toHaveScreenshot('music-notation.png', screenshotOpts);
});
