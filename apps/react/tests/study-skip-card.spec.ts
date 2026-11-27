import { Page } from '@playwright/test';
import {
	test,
	expect,
	seedTestData,
	uiLogin,
	initDeterministicEnv,
	screenshotOpts,
} from './helpers';

const scheduler = (page: Page) => page.evaluate(() => (window as any).store.getState().scheduler);

test('skipping a card takes it out of today’s session', async ({ page }) => {
	await initDeterministicEnv(page);
	const seed = await seedTestData(page);
	await uiLogin(page, 't@example.com', 'Testing123!');
	await page.goto(`/study/${seed.decks?.[0]?._id}`);
	await expect(page.getByText(/Sheet Music w\/ Chords/)).toBeVisible({ timeout: 10000 });

	const skipped = (await scheduler(page)).currCard;
	await page.getByRole('button', { name: 'Card options' }).first().click();
	await expect(page.locator('#root')).toHaveScreenshot('skip-card-menu.png', screenshotOpts);

	const [patch] = await Promise.all([
		page.waitForResponse((r) => r.url().endsWith('/skipped-cards')),
		page.getByRole('menuitem', { name: 'Skip for today' }).click(),
	]);
	expect(patch.ok()).toBe(true);
	const { currCard, nextCards } = await scheduler(page);
	expect(currCard).not.toBe(skipped);
	expect(nextCards).not.toContain(skipped);

	await page.reload();
	await expect(page.getByText(/Sheet Music w\/ Chords/)).toBeVisible({ timeout: 10000 });
	const reloaded = await scheduler(page);
	expect([reloaded.currCard, ...reloaded.nextCards]).not.toContain(skipped);
});
