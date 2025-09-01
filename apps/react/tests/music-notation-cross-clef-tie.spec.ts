import { test, expect } from './helpers';

test('MusicNotation cross-clef ties', async ({ page }) => {
	await page.goto('/tests/music-notation-cross-clef-tie-test.html');
	const ties = page.locator('g.vf-stavetie');
	await ties.first().waitFor();
	await expect(ties).toHaveCount(4);
});
