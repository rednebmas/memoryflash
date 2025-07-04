import { test, expect, captureAndCompareScreenshot, setupTest } from './helpers';

test('NotationInputScreen renders with whole rest - refactored version', async ({ page }) => {
	let capturedErrors: string[] = [];

	await setupTest(page, '/tests/notation-input-screen-test.html', (errors) => {
		capturedErrors = errors;
	});

	// Wait for the component to render
	await page.locator('#root').waitFor();
	await page.waitForTimeout(200);

	expect(capturedErrors).toEqual([]);

	await captureAndCompareScreenshot(
		page,
		'/tests/notation-input-screen-test.html',
		'notation-input-screen-refactored.png',
	);
});
