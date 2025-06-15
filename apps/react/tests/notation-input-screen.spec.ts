import { test, expect } from '@playwright/test';
import { screenshotOpts } from './helpers';
import fs from 'fs';
import path from 'path';

test('NotationInputScreen renders with whole rest', async ({ page }) => {
	const snapshotPath = path.join(
		path.dirname(new URL(import.meta.url).pathname),
		'notation-input-screen.spec.ts-snapshots',
		'notation-input-screen.png',
	);
	test.skip(!fs.existsSync(snapshotPath), 'snapshot missing');

	await page.goto('/tests/notation-input-screen-test.html');
	const output = page.locator('#output');
	await output.waitFor();
	await expect(output).toHaveScreenshot('notation-input-screen.png', screenshotOpts);
});
