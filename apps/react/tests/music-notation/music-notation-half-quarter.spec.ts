import { test, captureScreenshot } from '../helpers';

test('MusicNotation half and quarter notes screenshot', async ({ page }) => {
	await captureScreenshot(
		page,
		'/tests/music-notation/music-notation-half-quarter-test.html',
		'music-notation-half-quarter.png',
	);
});
