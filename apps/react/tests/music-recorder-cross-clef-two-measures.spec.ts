import { test, expect } from './helpers';

const events = [[60], [], [48], [], [60], [], [48], [], [60], []];

test('cross clef two measures no errors', async ({ page }) => {
	const errors: string[] = [];
	page.on('pageerror', (err) => errors.push(err.message));
	page.on('console', (msg) => {
		if (msg.type() === 'error') errors.push(msg.text());
	});

	await page.goto('/tests/music-recorder-cross-clef-two-measures-test.html');
	const output = page.locator('#root');

	for (const notes of events) {
		await page.evaluate((n) => {
			(window as any).recorder.addMidiNotes(n);
			(window as any).update();
		}, notes);
	}
	await output.waitFor();
	await expect(errors).toEqual([]);
});
