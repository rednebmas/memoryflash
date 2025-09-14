import { test, expect, runRecorderEvents } from './helpers';

async function interceptAttempts(page: any) {
	await page.route('**/attempts', (route: any) => route.fulfill({ status: 200, body: '{}' }));
}

for (const validator of ['exact', 'unexact'] as const) {
	test(`${validator} validator handles treble rest start`, async ({ page }) => {
		await interceptAttempts(page);
		await runRecorderEvents(
			page,
			`/tests/answer-validators-test.html?variant=start-rest&validator=${validator}`,
			[[48], [48, 60]],
		);
		const attempts = await page.evaluate(
			() => (window as any).store.getState().attempts.attempts.length,
		);
		expect(attempts).toBe(1);
	});

	test(`${validator} validator skips sustained notes`, async ({ page }) => {
		await interceptAttempts(page);
		await runRecorderEvents(
			page,
			`/tests/answer-validators-test.html?variant=sustain&validator=${validator}`,
			[[60]],
		);
		const attempts = await page.evaluate(
			() => (window as any).store.getState().attempts.attempts.length,
		);
		expect(attempts).toBe(1);
	});
}
