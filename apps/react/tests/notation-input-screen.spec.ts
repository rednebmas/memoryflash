import { test, expect, screenshotOpts } from './helpers';
import fs from 'fs';
import path from 'path';

test('NotationInputScreen renders with whole rest', async ({ page }) => {
	const errors: string[] = [];
	page.on('pageerror', (err) => errors.push(err.message));
	page.on('console', (msg) => {
		if (msg.type() === 'error') errors.push(msg.text());
	});

	await page.goto('/tests/notation-input-screen-test.html');
	const output = page.locator('#root');
	await output.waitFor();
	await page.waitForTimeout(200);

	expect(errors).toEqual([]);
	await expect(output).toHaveScreenshot('notation-input-screen.png', screenshotOpts);
});
