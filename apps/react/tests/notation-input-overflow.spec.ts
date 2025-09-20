import { test, expect, loadNotationInputScreen } from './helpers';

test('NotationInputScreen handles overflow input', async ({ page }) => {
	await loadNotationInputScreen(page);

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
