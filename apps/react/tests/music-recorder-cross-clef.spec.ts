import { test, expect, screenshotOpts } from './helpers';

test('MusicRecorder cross-clef rests', async ({ page }) => {
	await page.goto('/tests/music-recorder-cross-clef-test.html');
	const output = page.locator('#root');
	const events = [[60], [], [48], [], [60], [], [48], []];

	for (let i = 0; i < events.length; i++) {
		await page.evaluate((notes) => {
			(window as any).recorder.addMidiNotes(notes);
			(window as any).update();
		}, events[i]);
		await output.waitFor();
		await expect(output).toHaveScreenshot(
			`music-recorder-cross-clef-${i + 1}.png`,
			screenshotOpts,
		);
	}
});
