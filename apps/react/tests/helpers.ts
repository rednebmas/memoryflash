import { test as base, expect, Page, Locator } from '@playwright/test';

export const screenshotOpts = { maxDiffPixels: 32 };

// If the font does/doesn't load can cause small differences making tests more flaky
const blockFonts = process.env.BLOCK_REMOTE_FONTS === 'true';

export const test = base.extend<{
	page: Page;
	getButton: (name: string, options?: { exact?: boolean }) => Locator;
	clickButton: (name: string, options?: { exact?: boolean }) => Promise<void>;
}>({
	page: async ({ page }, use) => {
		const errors: string[] = [];
		page.on('pageerror', (err) => errors.push(err.message));
		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				const text = msg.text();
				if (text.includes('NotAllowedError')) return; // ignore WebMIDI permission errors in test
				if (text.includes('Failed to load resource')) return; // ignore resource loading errors in test
				if (text.includes('Cannot update a component')) return; // ignore React setState warnings in test
				errors.push(text);
			}
		});

		if (blockFonts) {
			await page.route('https://fonts.googleapis.com/**', (route) => route.abort());
			await page.route('https://fonts.gstatic.com/**', (route) => route.abort());
		}

		await page.addInitScript(() => {
			(window as any).__TEST_ENV__ = true;
		});

		await use(page);

		expect(errors).toEqual([]);
	},
	getButton: async ({ page }, use) => {
		await use((name: string, options: { exact?: boolean } = {}) =>
			page.getByRole('button', { name, exact: true, ...options }),
		);
	},
	clickButton: async ({ getButton }, use) => {
		await use(async (name: string, options: { exact?: boolean } = {}) => {
			await getButton(name, options).click();
		});
	},
});

export async function captureScreenshot(page: Page, url: string, name: string, selector = '#root') {
	await page.goto(url);
	const output = page.locator(selector);
	await output.waitFor();
	await expect(output).toHaveScreenshot(name, screenshotOpts);
}

export async function setStaticScroll(
	page: Page,
	options: { windowTop?: number; overflowTop?: number } = {},
) {
	const { windowTop = 0, overflowTop = 0 } = options;
	await page.evaluate(
		({ windowTop: winTop, overflowTop: overTop }) => {
			window.scrollTo(0, winTop);
			document.querySelector('.overflow-scroll')?.scrollTo(0, overTop);
		},
		{ windowTop, overflowTop },
	);
}

export async function runRecorderEvents(
	page: Page,
	url: string | undefined,
	events: number[][],
	prefix?: string,
	afterStep?: (index: number) => Promise<void> | void,
) {
	if (url) {
		await page.goto(url);
	}
	const output = page.locator('#root');
	await output.waitFor();

	for (let i = 0; i < events.length; i++) {
		const notes = events[i] ?? [];

		// Press all notes for this step
		await page.evaluate((ns) => {
			const dispatch = (window as any).store.dispatch;
			for (const n of ns) dispatch({ type: 'midi/addNote', payload: n });
		}, notes);

		// Allow React/Redux to propagate the change before releasing
		await page.waitForTimeout(0);

		// Release all notes for this step
		await page.evaluate((ns) => {
			const dispatch = (window as any).store.dispatch;
			for (const n of ns) dispatch({ type: 'midi/removeNote', payload: n });
		}, notes);

		await output.waitFor();
		if (prefix && notes.length > 0)
			await expect(output).toHaveScreenshot(`${prefix}-${i + 1}.png`, screenshotOpts);
		if (afterStep) await afterStep(i);
	}

	return output;
}

export { expect };

export async function stubMathRandom(page: Page, seedStart = 12345) {
	await page.addInitScript((seed) => {
		let s = seed;
		Math.random = () => {
			const x = Math.sin(s++) * 10000;
			return x - Math.floor(x);
		};
	}, seedStart);
}

export async function seedTestData(page: Page) {
	const res = await page.request.post('http://localhost:3333/test/seed');
	expect(res.ok()).toBeTruthy();
	const json: any = await res.json();
	if (Array.isArray(json?.decks)) {
		json.decks = [...json.decks].sort((a, b) => {
			const an = (a?.name as string) || (a?.uid as string) || '';
			const bn = (b?.name as string) || (b?.uid as string) || '';
			return an < bn ? -1 : an > bn ? 1 : 0;
		});
	}
	return json;
}

export async function uiLogin(page: Page, email: string, password: string) {
	await page.goto('/auth/login');
	await page.fill('#email', email);
	await page.fill('#password', password);
	const [response] = await Promise.all([
		page.waitForResponse((r) => r.url().includes('/auth/log-in')),
		page.click('button:has-text("Login")'),
	]);
	if (response.status() !== 200) throw new Error(`Login failed: ${await response.text()}`);
	await page.waitForURL((url) => !url.toString().includes('/auth/login'), { timeout: 5000 });
}

// One-shot setup to make UI tests deterministic across the board
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

export async function createCourse(page: Page, name: string) {
	await page.goto('/');
	await page.getByRole('button', { name: 'Create Course' }).click();
	await page.fill('#input-modal', name);
	const [response] = await Promise.all([
		page.waitForResponse(
			(r) => r.url().endsWith('/courses') && r.request().method() === 'POST',
		),
		page.getByRole('button', { name: 'Save' }).click(),
	]);
	expect(response.ok()).toBeTruthy();
	const { course } = await response.json();
	return course?._id as string;
}

export async function createDeck(page: Page, courseId: string, name: string) {
	await page.goto(`/course/${courseId}`);
	await page.getByRole('button', { name: 'Create Deck' }).click();
	await page.fill('#input-modal', name);
	const [response] = await Promise.all([
		page.waitForResponse((r) => r.url().endsWith('/decks') && r.request().method() === 'POST'),
		page.getByRole('button', { name: 'Save' }).click(),
	]);
	expect(response.ok()).toBeTruthy();
	const { deck } = await response.json();
	return deck?._id as string;
}
