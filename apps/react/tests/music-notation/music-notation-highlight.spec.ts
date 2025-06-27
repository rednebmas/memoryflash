import { test, captureScreenshot } from '../helpers';

test.describe('highlight notes', () => {
	for (const index of [1, 2, 3, 4]) {
		test(`highlight note ${index}`, async ({ page }) => {
			await captureScreenshot(
				page,
				`/tests/music-notation/music-notation-test.html?index=${index}`,
				`highlight-${index}.png`,
			);
		});
	}
});
