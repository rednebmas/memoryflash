import { test, expect } from '@playwright/test';
import { screenshotOpts } from './helpers';

test('MusicRecorder bass clef screenshot', async ({ page }) => {
	await page.goto('/tests/music-recorder-bass-clef-test.html');
	const output = page.locator('#output');
	const events = [[64], [64, 48], []];

	for (let i = 0; i < events.length; i++) {
		await page.evaluate((notes) => {
			(window as any).recorder.addMidiNotes(notes);
			(window as any).update();
		}, events[i]);
		await output.waitFor();
		await expect(output).toHaveScreenshot(
			`music-recorder-bass-clef-${i + 1}.png`,
			screenshotOpts,
		);
	}
});
