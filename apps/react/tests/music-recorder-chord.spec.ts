import { test, expect, screenshotOpts, runRecorderEvents } from './helpers';

test('MusicRecorder chord screenshot', async ({ page }) => {
	const events = [[60], [60, 64], [60, 64, 67], [], [65]];

	await runRecorderEvents(
		page,
		'/tests/music-recorder-chord-test.html',
		events,
		'music-recorder-chord',
	);
});
