import { test, expect } from './helpers';

// Ensure markdown is rendered in text prompt preview

test('NotationInputScreen renders markdown for text prompt', async ({ page }) => {
	await page.goto('/tests/notation-input-screen-test.html');
	const output = page.locator('#root');
	await output.waitFor();

	await page.locator('button:has-text("Sheet Music")').click();
	await page.getByRole('menuitem', { name: 'Text Prompt' }).click();
	await page.fill('#text-prompt', '**bold** _italic_');
	await page.getByRole('checkbox', { name: 'Preview' }).check();

	await expect(output.locator('strong')).toHaveText('bold');
	await expect(output.locator('em')).toHaveText('italic');
});
