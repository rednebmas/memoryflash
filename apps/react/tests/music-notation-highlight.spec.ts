import { test, expect } from '@playwright/test';
import { screenshotOpts } from './helpers';

test.describe('highlight notes', () => {
	for (const index of [1, 2, 3, 4]) {
		test(`highlight note ${index}`, async ({ page }) => {
			await page.goto(`/test/music-notation-test.html?index=${index}`);
			const output = page.locator('#output');
			await output.waitFor();
			await expect(output).toHaveScreenshot(`highlight-${index}.png`, screenshotOpts);
		});
	}
});
