import { test, expect, captureAndCompareScreenshot, setupTest, addMidiNotes } from './helpers';

test.describe('Helper Utilities', () => {
	test('captureAndCompareScreenshot works without interactions', async ({ page }) => {
		await captureAndCompareScreenshot(
			page,
			'/tests/music-notation-test.html',
			'helpers-test-basic.png',
		);
	});

	test('captureAndCompareScreenshot works with interactions', async ({ page }) => {
		await captureAndCompareScreenshot(
			page,
			'/tests/music-recorder-chord-test.html',
			'helpers-test-with-interactions.png',
			'#root',
			[
				async () => await addMidiNotes(page, [60]),
				async () => await addMidiNotes(page, [60, 64]),
			],
		);
	});

	test('setupTest handles errors correctly', async ({ page }) => {
		let capturedErrors: string[] = [];

		await setupTest(page, '/tests/music-notation-test.html', (errors) => {
			capturedErrors = errors;
		});

		expect(capturedErrors).toEqual([]);
	});

	test('addMidiNotes helper works correctly', async ({ page }) => {
		await page.goto('/tests/music-recorder-chord-test.html');
		const output = page.locator('#root');
		await output.waitFor();

		await addMidiNotes(page, [60]);
		await addMidiNotes(page, []);

		// Just verify the page loads without errors
		await expect(output).toBeVisible();
	});
});
