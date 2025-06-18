import { test, expect } from './helpers';

test('MusicRecorder cross-clef rests', async ({ page }) => {
	let errors: string[] = [];
	page.on('pageerror', (err) => errors.push(err.message));
	page.on('console', (msg) => {
		if (msg.type() === 'error') errors.push(msg.text());
	});

	await page.goto('/tests/music-recorder-cross-clef-test.html');
	const events = [[60], [], [48], [], [60], [], [48], []];

	for (const ev of events) {
		await page.evaluate((notes) => {
			(window as any).recorder.addMidiNotes(notes);
			(window as any).update();
		}, ev);
	}
	await page.waitForTimeout(200);
	expect(errors).toEqual([]);
});
