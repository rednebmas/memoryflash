import { expect, Page } from '@playwright/test';

export const openDeckSettings = async (page: Page) => {
	await expect(page.getByText(/Sheet Music w\/ Chords/)).toBeVisible({ timeout: 10000 });
	await page.locator('div.cursor-pointer:has(svg path[d^="M9.594"])').first().click();
	return page.locator('[id^=headlessui-dialog-panel]');
};
