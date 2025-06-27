import { test, expect, screenshotOpts } from './helpers';

const events = [[60], [], [48], [], [60], [], [48], [], [60], []];

test('cross clef two measures', async ({ page }) => {
	const errors: string[] = [];
	page.on('pageerror', (err) => errors.push(err.message));
	page.on('console', (msg) => {
		if (msg.type() === 'error') errors.push(msg.text());
	});

	await page.goto('/tests/music-recorder-cross-clef-two-measures-test.html');
	const output = page.locator('#root');

	for (let i = 0; i < events.length; i++) {
		await page.evaluate((notes) => {
			(window as any).recorder.addMidiNotes(notes);
			(window as any).update();
		}, events[i]);
		await output.waitFor();
		await expect(output).toHaveScreenshot(
			`music-recorder-cross-clef-two-measures-${i + 1}.png`,
			screenshotOpts,
		);
	}

	await expect(errors).toEqual([]);
});
