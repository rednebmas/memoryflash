import { test, loadTestPage, runRecorderEvents } from '../helpers';

test('MusicRecorder cross-clef rests', async ({ page }) => {
	const output = await loadTestPage(
		page,
		'/tests/music-recorder/music-recorder-cross-clef-test.html',
	);
	const events = [[60], [], [48], [], [60], [], [48], []];

	await runRecorderEvents(page, output, events, 'music-recorder-cross-clef');
});
