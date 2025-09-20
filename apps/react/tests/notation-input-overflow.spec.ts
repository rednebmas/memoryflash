import { test, expect, runRecorderEvents } from './helpers';

test('NotationInputScreen handles overflow input', async ({ page }) => {
	await runRecorderEvents(page, '/tests/notation-input-screen-test.html', [
		[60],
		[62],
		[64],
		[65],
		[67],
	]);
	await page.waitForTimeout(200);
});
