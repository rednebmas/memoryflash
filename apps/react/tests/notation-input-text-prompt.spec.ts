import { test, expect, screenshotOpts } from './helpers';

// Test selecting Text Prompt card type on NotationInputScreen

test('NotationInputScreen text prompt card type', async ({ page }) => {
	const errors: string[] = [];
	page.on('pageerror', (err) => errors.push(err.message));
	page.on('console', (msg) => {
		if (msg.type() === 'error') errors.push(msg.text());
	});

	await page.goto('/tests/notation-input-screen-test.html');
	const output = page.locator('#root');
	await output.waitFor();

	await page.locator('button:has-text("Sheet Music")').click();
	await page.getByRole('menuitem', { name: 'Text Prompt' }).click();
	await page.fill('#text-prompt', 'Hotel California verse');
	await page.waitForTimeout(200);
	await page.evaluate(() => {
		window.scrollTo(0, 0);
		document.querySelector('.overflow-scroll')?.scrollTo(0, 0);
	});

	expect(errors).toEqual([]);
	await expect(output).toHaveScreenshot('notation-input-text-prompt.png', screenshotOpts);
});
