import { test, captureAndCompareScreenshot, addMidiNotes } from './helpers';

test('MusicRecorder two measures - refactored version', async ({ page }) => {
	const events = [60, 62, 64, 65, 67, 69, 71, 72, 74];

	const interactions = [];

	// Build the interactions array
	for (const note of events) {
		interactions.push(async () => await addMidiNotes(page, [note]));
		interactions.push(async () => await addMidiNotes(page, []));
	}

	await captureAndCompareScreenshot(
		page,
		'/tests/music-recorder-two-measures-test.html',
		'music-recorder-two-measures-refactored.png',
		'#root',
		interactions,
	);
});
