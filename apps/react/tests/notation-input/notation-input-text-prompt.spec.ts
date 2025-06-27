import { test, expect, screenshotOpts, loadTestPage, createErrorCollector } from '../helpers';

// Test selecting Text Prompt card type on NotationInputScreen

test('NotationInputScreen text prompt card type', async ({ page }) => {
	const errors = createErrorCollector(page);
	const output = await loadTestPage(
		page,
		'/tests/notation-input/notation-input-screen-test.html',
	);

	await page.locator('button:has-text("Sheet Music")').click();
	await page.getByRole('menuitem', { name: 'Text Prompt' }).click();
	await page.fill('#text-prompt', 'Hotel California verse');
	await page.waitForTimeout(200);
	await page.evaluate(() => {
		window.scrollTo(0, 0);
		document.querySelector('.overflow-scroll')?.scrollTo(0, 300);
	});

	expect(errors).toEqual([]);
	await expect(output).toHaveScreenshot('notation-input-text-prompt.png', screenshotOpts);
});
