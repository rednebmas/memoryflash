import { test, expect } from '@playwright/test';
import { screenshotOpts } from './helpers';

test('MusicNotation half and quarter notes screenshot', async ({ page }) => {
	await page.goto('/music-notation-half-quarter-test.html');
	const output = page.locator('#output');
	await output.waitFor();
	await expect(output).toHaveScreenshot('music-notation-half-quarter.png', screenshotOpts);
});
