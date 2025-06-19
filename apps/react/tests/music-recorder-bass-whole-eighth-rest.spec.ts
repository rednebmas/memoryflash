import { test, expect, screenshotOpts } from './helpers';

test('MusicRecorder bass whole with treble eighth rest then notes', async ({ page }) => {
	await page.goto('/tests/music-recorder-bass-whole-eighth-rest-test.html');
	const output = page.locator('#output');

	const treble = [[60], [], [62], [], [64], [], [65], []];

	for (let i = 0; i < treble.length; i++) {
		await page.evaluate((notes) => {
			(window as any).recorder.addMidiNotes(notes);
			(window as any).update();
		}, treble[i]);
		await output.waitFor();
		await expect(output).toHaveScreenshot(
			`music-recorder-bass-whole-eighth-rest-${i + 1}.png`,
			screenshotOpts,
		);
		if (i === 1) {
			await page.evaluate(() => {
				(window as any).recorder.updateDuration('q', 'Treble');
			});
		}
	}

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
