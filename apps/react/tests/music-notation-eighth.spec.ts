import { test, captureScreenshot } from './helpers';

test('MusicNotation eighth notes screenshot', async ({ page }) => {
	await captureScreenshot(
		page,
		'/tests/music-notation-eighth-test.html',
		'music-notation-eighth.png',
	);
});
