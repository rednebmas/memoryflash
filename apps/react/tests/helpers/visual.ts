import { expect, Page } from '@playwright/test';
import { screenshotOpts } from './screenshotOptions';

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
