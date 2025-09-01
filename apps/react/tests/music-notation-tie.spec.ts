import { test, captureScreenshot } from './helpers';

test('MusicNotation ties screenshot', async ({ page }) => {
	await captureScreenshot(page, '/tests/music-notation-tie-test.html', 'music-notation-tie.png');
});
