import { test, expect, screenshotOpts } from './helpers';

test('Transpositions header expands the key picker when clicked', async ({ page }) => {
	await page.goto('/tests/notation-input-screen-test.html');
	await page.locator('#root').waitFor();

	const header = page.getByRole('button', { name: /Transpositions/ });
	await expect(header).toContainText('None selected — click to choose keys');
	await expect(header).toHaveAttribute('aria-expanded', 'false');

	await header.click();
	await expect(header).toHaveAttribute('aria-expanded', 'true');
	await expect(page.getByText('Lowest')).toBeVisible();
	await page.getByRole('button', { name: 'None', exact: true }).scrollIntoViewIfNeeded();
	await page.mouse.wheel(0, 200);
	await page.mouse.move(0, 0);
	await page.waitForTimeout(200);
	await expect(page).toHaveScreenshot(
		'notation-input-transpositions-expanded.png',
		screenshotOpts,
	);
});
