import { Page } from '@playwright/test';
import { expect } from './fixtures';

// Waits on the Redux network state rather than the 2s toast, which a slow save outlives
export const clickAndAwaitNetworkCall = async (
	page: Page,
	name: string,
	click: () => Promise<void>,
) => {
	await click();
	const settled = await page.waitForFunction((n) => {
		const call = (window as any).store.getState().network._[n];
		return call && !call.isLoading && { error: call.error };
	}, name);
	expect(await settled.jsonValue()).toEqual({ error: null });
};
