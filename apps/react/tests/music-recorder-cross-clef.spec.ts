import { test, expect, screenshotOpts, runRecorderEvents } from './helpers';

test('MusicRecorder cross-clef rests', async ({ page }) => {
	const events = [[60], [], [48], [], [60], [], [48], []];

	await runRecorderEvents(
		page,
		'/tests/music-recorder-cross-clef-test.html',
		events,
		'music-recorder-cross-clef',
	);
});
