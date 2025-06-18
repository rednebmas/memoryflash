import { test, captureScreenshot } from './helpers';

test('MusicNotation component screenshot', async ({ page }) => {
	await captureScreenshot(page, '/tests/music-notation-test.html', 'music-notation.png');
});
