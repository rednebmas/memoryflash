import { test, captureScreenshot } from './helpers';

test('MusicNotation rests screenshot', async ({ page }) => {
	await captureScreenshot(
		page,
		'/tests/music-notation-rest-test.html',
		'music-notation-rest.png',
	);
});
