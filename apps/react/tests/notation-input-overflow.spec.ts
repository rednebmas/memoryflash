import { test, expect } from './helpers';

test('NotationInputScreen handles overflow input', async ({ page }) => {
	await page.goto('/tests/notation-input-screen-test.html');
	await page.locator('#root').waitFor();

	const press = async (midi: number) => {
		await page.evaluate((n) => {
			(window as any).store.dispatch({ type: 'midi/addNote', payload: n });
		}, midi);
		await page.evaluate((n) => {
			(window as any).store.dispatch({ type: 'midi/removeNote', payload: n });
		}, midi);
	};

	for (const m of [60, 62, 64, 65]) {
		await press(m);
	}
	await press(67);
	await page.waitForTimeout(200);
});
