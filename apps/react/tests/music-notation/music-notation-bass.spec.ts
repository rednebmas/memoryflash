import { test, captureScreenshot } from '../helpers';

test('MusicNotation bass clef screenshot', async ({ page }) => {
	await captureScreenshot(
		page,
		'/tests/music-notation/music-notation-bass-test.html',
		'music-notation-bass.png',
	);
});
