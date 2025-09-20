import { test, expect, screenshotOpts, loadNotationInputScreen } from './helpers';
import fs from 'fs';
import path from 'path';

test('NotationInputScreen renders with whole rest', async ({ page }) => {
	const output = await loadNotationInputScreen(page);
	await page.waitForTimeout(200);
	await expect(output).toHaveScreenshot('notation-input-screen.png', screenshotOpts);
});
