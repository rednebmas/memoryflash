import { test, expect, screenshotOpts } from './helpers';

test('MusicNotation rests screenshot', async ({ page }) => {
	await page.goto('/tests/music-notation-rest-test.html');
	const output = page.locator('#output');
	await output.waitFor();
	await expect(output).toHaveScreenshot('music-notation-rest.png', screenshotOpts);
});
