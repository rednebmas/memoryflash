import { test, captureScreenshot } from './helpers';

test('MusicNotation accidentals screenshot', async ({ page }) => {
	await captureScreenshot(
		page,
		'/tests/music-notation-accidentals-test.html',
		'music-notation-accidentals.png',
	);
});
