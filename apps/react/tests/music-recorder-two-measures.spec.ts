import { test, expect, screenshotOpts } from './helpers';

test('MusicRecorder two measures screenshot', async ({ page }) => {
	await page.goto('/tests/music-recorder-two-measures-test.html');
	const output = page.locator('#root');
	const events = [60, 62, 64, 65, 67, 69, 71, 72, 74];
	for (const m of events) {
		await page.evaluate((n) => {
			(window as any).recorder.addMidiNotes([n]);
			(window as any).update();
		}, m);
		await page.evaluate(() => {
			(window as any).recorder.addMidiNotes([]);
			(window as any).update();
		});
	}
	await output.waitFor();
	await expect(output).toHaveScreenshot('music-recorder-two-measures.png', screenshotOpts);
});
