import { test, expect, screenshotOpts, loadTestPage } from '../helpers';

test('MusicRecorder bass whole with treble quarters', async ({ page }) => {
	const output = await loadTestPage(
		page,
		'/tests/music-recorder/music-recorder-bass-whole-quarter-test.html',
	);

	const treble = [[60], [], [62], [], [64], [], [65], []];

	for (let i = 0; i < treble.length; i++) {
		await page.evaluate((notes) => {
			(window as any).recorder.addMidiNotes(notes);
			(window as any).update();
		}, treble[i]);
		await output.waitFor();
		await expect(output).toHaveScreenshot(
			`music-recorder-bass-whole-quarter-${i + 1}.png`,
			screenshotOpts,
		);
	}

	await page.evaluate(() => {
		(window as any).recorder.currentBeat = 0;
		(window as any).recorder.updateDuration('w', 'Bass');
		(window as any).recorder.addMidiNotes([48]);
		(window as any).update();
	});
	await output.waitFor();
	await expect(output).toHaveScreenshot(
		'music-recorder-bass-whole-quarter-9.png',
		screenshotOpts,
	);

	await page.evaluate(() => {
		(window as any).recorder.addMidiNotes([]);
		(window as any).update();
	});
	await output.waitFor();
	await expect(output).toHaveScreenshot(
		'music-recorder-bass-whole-quarter-10.png',
		screenshotOpts,
	);
});
