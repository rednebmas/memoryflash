import { test, expect } from '@playwright/test';
import { screenshotOpts } from './test-utils';

test('MusicNotation component screenshot', async ({ page }) => {
	await page.goto('/music-notation-test.html');
	const output = page.locator('#output');
	await output.waitFor();
	await expect(output).toHaveScreenshot('music-notation.png', screenshotOpts);
});
