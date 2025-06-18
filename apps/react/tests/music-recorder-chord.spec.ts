import { test, expect } from '@playwright/test';
import { screenshotOpts } from './helpers';

test('MusicRecorder chord screenshot', async ({ page }) => {
	await page.goto('/tests/music-recorder-chord-test.html');
	const output = page.locator('#output');
	const events = [[60], [60, 64], [60, 64, 67], [], [65]];

	for (let i = 0; i < events.length; i++) {
		await page.evaluate((notes) => {
			(window as any).recorder.addMidiNotes(notes);
			(window as any).update();
		}, events[i]);
		await output.waitFor();
		await expect(output).toHaveScreenshot(`music-recorder-chord-${i + 1}.png`, screenshotOpts);
	}
});
