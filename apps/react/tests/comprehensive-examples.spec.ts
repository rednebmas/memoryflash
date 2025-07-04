import { test, expect, captureAndCompareScreenshot, setupTest, addMidiNotes } from './helpers';

test.describe('Enhanced Testing Utilities - Comprehensive Examples', () => {
	test('Complex test with error handling and interactions', async ({ page }) => {
		let capturedErrors: string[] = [];

		await setupTest(page, '/tests/music-recorder-chord-test.html', (errors) => {
			capturedErrors = errors;
		});

		// Ensure no errors occurred during setup
		expect(capturedErrors).toEqual([]);

		// Complex interaction pattern
		await captureAndCompareScreenshot(
			page,
			'/tests/music-recorder-chord-test.html',
			'comprehensive-example-complex.png',
			'#root',
			[
				async () => await addMidiNotes(page, [60, 64, 67]), // C major chord
				async () => await page.waitForTimeout(100), // Wait a bit
				async () => await addMidiNotes(page, []), // Clear
				async () => await addMidiNotes(page, [65, 69, 72]), // F major chord
			],
		);
	});

	test('Parameterized test with custom interactions', async ({ page }) => {
		const testCases = [
			{
				url: '/tests/music-recorder-chord-test.html',
				name: 'param-chord-1.png',
				notes: [60, 64, 67], // C major
			},
			{
				url: '/tests/music-recorder-chord-test.html',
				name: 'param-chord-2.png',
				notes: [65, 69, 72], // F major
			},
			{
				url: '/tests/music-recorder-chord-test.html',
				name: 'param-chord-3.png',
				notes: [67, 71, 74], // G major
			},
		];

		for (const { url, name, notes } of testCases) {
			await captureAndCompareScreenshot(page, url, name, '#root', [
				async () => await addMidiNotes(page, notes),
			]);
		}
	});

	test('Error handling with custom selector', async ({ page }) => {
		let capturedErrors: string[] = [];

		await setupTest(page, '/tests/music-notation-test.html', (errors) => {
			capturedErrors = errors;
		});

		expect(capturedErrors).toEqual([]);

		await captureAndCompareScreenshot(
			page,
			'/tests/music-notation-test.html',
			'custom-selector-example.png',
			'#root', // Custom selector
		);
	});
});
