import { test, loadTestPage, runRecorderEvents } from '../helpers';

test('MusicRecorder chord screenshot', async ({ page }) => {
	const output = await loadTestPage(page, '/tests/music-recorder/music-recorder-chord-test.html');
	const events = [[60], [60, 64], [60, 64, 67], [], [65]];

	await runRecorderEvents(page, output, events, 'music-recorder-chord');
});
