import { Page } from '@playwright/test';

export async function stubMathRandom(page: Page, seedStart = 12345) {
	await page.addInitScript((seed) => {
		let s = seed;
		Math.random = () => {
			const x = Math.sin(s++) * 10000;
			return x - Math.floor(x);
		};
	}, seedStart);
}

export async function initDeterministicEnv(page: Page, seed = 12345) {
	await stubMathRandom(page, seed);
	await page.route('**/decks/*', async (route) => {
		if (route.request().method() !== 'GET') return route.fallback();
		const response = await route.fetch();
		let json: any;
		try {
			json = await response.json();
		} catch (_) {
			return route.fulfill({ response });
		}
		if (Array.isArray(json?.cards)) {
			json.cards = [...json.cards].sort((a, b) => {
				const ak = (a?.uid as string) || (a?._id as string) || '';
				const bk = (b?.uid as string) || (b?._id as string) || '';
				return ak < bk ? -1 : ak > bk ? 1 : 0;
			});
		}
		await route.fulfill({
			response,
			body: JSON.stringify(json),
			headers: { ...response.headers(), 'content-type': 'application/json' },
		});
	});
}
