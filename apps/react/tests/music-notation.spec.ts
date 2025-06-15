import { test, expect } from '@playwright/test';
import { screenshotOpts } from './helpers';

test('MusicNotation component screenshot', async ({ page }) => {
	await page.goto('/test/music-notation-test.html');
	const output = page.locator('#output');
	await output.waitFor();
	await expect(output).toHaveScreenshot('music-notation.png', screenshotOpts);
});
