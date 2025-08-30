import { test, captureScreenshot } from './helpers';

test('MusicNotation E major accidentals screenshot', async ({ page }) => {
	await captureScreenshot(
		page,
		'/tests/music-notation-accidentals-e-major-test.html',
		'music-notation-accidentals-e-major.png',
	);
});
