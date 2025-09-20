import { test, runRecorderEvents } from './helpers';

test('NotationInputScreen handles overflow input', async ({ page }) => {
	await page.goto('/tests/notation-input-screen-test.html');
	await page.locator('#root').waitFor();

	await runRecorderEvents(page, undefined, [[60], [62], [64], [65], [67]]);
	await page.waitForTimeout(200);
});
