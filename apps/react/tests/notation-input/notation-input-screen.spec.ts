import { test, expect, screenshotOpts, loadTestPage, createErrorCollector } from '../helpers';
import fs from 'fs';
import path from 'path';

test('NotationInputScreen renders with whole rest', async ({ page }) => {
	const errors = createErrorCollector(page);
	const output = await loadTestPage(
		page,
		'/tests/notation-input/notation-input-screen-test.html',
	);
	await page.waitForTimeout(200);
	await page.waitForTimeout(200);

	expect(errors).toEqual([]);
	await expect(output).toHaveScreenshot('notation-input-screen.png', screenshotOpts);
});
