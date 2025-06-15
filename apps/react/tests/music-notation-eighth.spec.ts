import { test, expect } from '@playwright/test';
import { screenshotOpts } from './test-utils';

test('MusicNotation eighth notes screenshot', async ({ page }) => {
	await page.goto('/music-notation-eighth-test.html');
	const output = page.locator('#output');
	await output.waitFor();
	await expect(output).toHaveScreenshot('music-notation-eighth.png', screenshotOpts);
});
