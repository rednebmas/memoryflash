import { test, expect, screenshotOpts } from './helpers';

test('cross clef chord input', async ({ page }) => {
	const errors: string[] = [];
	page.on('pageerror', (err) => errors.push(err.message));
	page.on('console', (msg) => {
		if (msg.type() === 'error') errors.push(msg.text());
	});

	await page.goto('/tests/notation-input-screen-test.html');
	const output = page.locator('#root');
	await output.waitFor();

	const press = async (midi: number) => {
		await page.evaluate(
			(n) => (window as any).store.dispatch({ type: 'midi/addNote', payload: n }),
			midi,
		);
		await page.waitForTimeout(50);
	};
	const release = async (midi: number) =>
		page.evaluate(
			(n) => (window as any).store.dispatch({ type: 'midi/removeNote', payload: n }),
			midi,
		);

	const scrollToNotation = () =>
		page.evaluate(() => {
			window.scrollTo(0, 0);
			document.querySelector('.overflow-scroll')?.scrollTo(0, 300);
		});

	for (const [i, n] of [36, 48, 60, 72].entries()) {
		await press(n);
		await scrollToNotation();
		await output.waitFor();
		await expect(output).toHaveScreenshot(
			`notation-input-cross-clef-chord-${i + 1}.png`,
			screenshotOpts,
		);
	}
	for (const n of [36, 48, 60, 72]) {
		await release(n);
	}

	await page.waitForTimeout(200);
	expect(errors).toEqual([]);
});
