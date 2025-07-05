import { test, expect, screenshotOpts } from './helpers';
import fs from 'fs';
import path from 'path';

test('NotationInputScreen renders with whole rest', async ({ page }) => {
	await page.goto('/tests/notation-input-screen-test.html');
	const output = page.locator('#root');
	await output.waitFor();
	await page.waitForTimeout(200);
	await expect(output).toHaveScreenshot('notation-input-screen.png', screenshotOpts);
});
