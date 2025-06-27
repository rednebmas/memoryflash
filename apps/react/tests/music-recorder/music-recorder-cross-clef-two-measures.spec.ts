import { test, expect, loadTestPage, runRecorderEvents, createErrorCollector } from '../helpers';

const events = [[60], [], [48], [], [60], [], [48], [], [60], []];

test('cross clef two measures', async ({ page }) => {
	const errors = createErrorCollector(page);
	const output = await loadTestPage(
		page,
		'/tests/music-recorder/music-recorder-cross-clef-two-measures-test.html',
	);

	await runRecorderEvents(page, output, events, 'music-recorder-cross-clef-two-measures');

	await expect(errors).toEqual([]);
});
