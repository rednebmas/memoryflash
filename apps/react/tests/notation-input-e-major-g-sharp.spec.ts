import { test, expect, screenshotOpts, runRecorderEvents } from './helpers';

test('NotationInputScreen E major G# rendering', async ({ page }) => {
	await page.goto('/tests/notation-input-screen-test.html');
	const output = page.locator('#root');
	await output.waitFor();

	// Select E major (index 4 in majorKeys array: C=0, G=1, D=2, A=3, E=4)
	await page.locator('label:has-text("Key") select').selectOption('E');

	// Wait for UI to update
	await page.waitForTimeout(100);

	// Simulate pressing G#4 (MIDI note 68)
	const events = [[64],[68], [67]];
	await runRecorderEvents(page, undefined, events);

	// Wait a bit for rendering
	await page.evaluate(() => {
		window.scrollTo(0, 0);
		document.querySelector('.overflow-scroll')?.scrollTo(0, 300);
	});

	await expect(output).toHaveScreenshot('notation-input-e-major-g-sharp.png', screenshotOpts);
});
