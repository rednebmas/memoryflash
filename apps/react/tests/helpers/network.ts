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

// Fakes the generate-cards job: POST starts it, polls report 'generating' until finished is set
export const mockGenerateCards = async (page: Page, song: object) => {
	const job = { body: {} as Record<string, unknown>, finished: true };
	await page.route('**/generate-cards', async (route) => {
		job.body = route.request().postDataJSON();
		await route.fulfill({ json: { jobId: 'job1' } });
	});
	await page.route('**/generate-cards/job1', (route) =>
		route.fulfill({
			json: job.finished ? { stage: 'building', song } : { stage: 'generating' },
		}),
	);
	return job;
};
