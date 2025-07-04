import { test, captureAndCompareScreenshot, addMidiNotes } from './helpers';

test('MusicRecorder chord screenshot - refactored version', async ({ page }) => {
	const events = [[60], [60, 64], [60, 64, 67], [], [65]];

	for (let i = 0; i < events.length; i++) {
		await captureAndCompareScreenshot(
			page,
			'/tests/music-recorder-chord-test.html',
			`music-recorder-chord-refactored-${i + 1}.png`,
			'#root',
			[async () => await addMidiNotes(page, events[i])],
		);
	}
});
