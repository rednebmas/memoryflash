import { test, expect, screenshotOpts, runRecorderEvents } from './helpers';

test('MusicRecorder bass whole with treble eighth rest then notes', async ({ page }) => {
	const treble = [[60], [], [62], [], [64], [], [65], []];

	const output = await runRecorderEvents(
		page,
		'/tests/music-recorder-bass-whole-eighth-rest-test.html',
		treble,
		'music-recorder-bass-whole-eighth-rest',
		async (i) => {
			if (i === 1)
				await page.evaluate(() => (window as any).recorder.updateDuration('q', 'Treble'));
		},
	);

	await page.evaluate(() => {
		(window as any).recorder.currentBeat = 0;
		(window as any).recorder.updateDuration('w', 'Bass');
		(window as any).recorder.addMidiNotes([48]);
		(window as any).update();
	});
	await output.waitFor();
	await expect(output).toHaveScreenshot(
		'music-recorder-bass-whole-eighth-rest-9.png',
		screenshotOpts,
	);

	await page.evaluate(() => {
		(window as any).recorder.addMidiNotes([]);
		(window as any).update();
	});
	await output.waitFor();
	await expect(output).toHaveScreenshot(
		'music-recorder-bass-whole-eighth-rest-10.png',
		screenshotOpts,
	);
});
