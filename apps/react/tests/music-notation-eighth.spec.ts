import { test, expect, screenshotOpts } from './helpers';

test('MusicNotation eighth notes screenshot', async ({ page }) => {
	await page.goto('/tests/music-notation-eighth-test.html');
	const output = page.locator('#output');
	await output.waitFor();
	await expect(output).toHaveScreenshot('music-notation-eighth.png', screenshotOpts);
});
