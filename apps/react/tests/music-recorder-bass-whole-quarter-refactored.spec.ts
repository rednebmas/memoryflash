import {
	test,
	captureAndCompareScreenshot,
	addMidiNotes,
	updateRecorderDuration,
	resetRecorderBeat,
} from './helpers';

test('MusicRecorder bass whole with treble quarters - refactored version', async ({ page }) => {
	const treble = [[60], [], [62], [], [64], [], [65], []];

	// Handle the treble quarter notes sequence
	for (let i = 0; i < treble.length; i++) {
		await captureAndCompareScreenshot(
			page,
			'/tests/music-recorder-bass-whole-quarter-test.html',
			`music-recorder-bass-whole-quarter-refactored-${i + 1}.png`,
			'#root',
			[async () => await addMidiNotes(page, treble[i])],
		);
	}

	// Handle the bass whole note update
	await captureAndCompareScreenshot(
		page,
		'/tests/music-recorder-bass-whole-quarter-test.html',
		'music-recorder-bass-whole-quarter-refactored-9.png',
		'#root',
		[
			async () => await resetRecorderBeat(page),
			async () => await updateRecorderDuration(page, 'w', 'Bass'),
			async () => await addMidiNotes(page, [48]),
		],
	);

	// Handle the final clear
	await captureAndCompareScreenshot(
		page,
		'/tests/music-recorder-bass-whole-quarter-test.html',
		'music-recorder-bass-whole-quarter-refactored-10.png',
		'#root',
		[async () => await addMidiNotes(page, [])],
	);
});
