import { test, expect, screenshotOpts, runRecorderEvents } from './helpers';

const events = [[60], [], [48], [], [60], [], [48], [], [60], []];

test('cross clef two measures', async ({ page }) => {
	await runRecorderEvents(
		page,
		'/tests/music-recorder-cross-clef-two-measures-test.html',
		events,
		'music-recorder-cross-clef-two-measures',
	);
});
