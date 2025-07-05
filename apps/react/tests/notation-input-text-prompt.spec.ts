import { test, expect, screenshotOpts } from './helpers';

// Test selecting Text Prompt card type on NotationInputScreen

test('NotationInputScreen text prompt card type', async ({ page }) => {
	await page.goto('/tests/notation-input-screen-test.html');
	const output = page.locator('#root');
	await output.waitFor();

	await page.locator('button:has-text("Sheet Music")').click();
	await page.getByRole('menuitem', { name: 'Text Prompt' }).click();
	await page.fill('#text-prompt', 'Hotel California verse');
	await page.waitForTimeout(200);
	await page.evaluate(() => {
		window.scrollTo(0, 0);
		document.querySelector('.overflow-scroll')?.scrollTo(0, 300);
	});

	await expect(output).toHaveScreenshot('notation-input-text-prompt.png', screenshotOpts);
});
