import {
	test,
	expect,
	uiLogin,
	seedTestData,
	initDeterministicEnv,
	screenshotOpts,
	runRecorderEvents,
} from './helpers';
import { seedTornDeck, tornChorusEvents } from './helpers/tornDeck';

test('Text prompt cards show song, section and segmented progress', async ({ page }) => {
	await page.setViewportSize({ width: 1512, height: 862 });
	await initDeterministicEnv(page);
	await seedTestData(page);
	await uiLogin(page, 't@example.com', 'Testing123!');
	const deckId = await seedTornDeck(page);

	await page.goto(`/study/${deckId}`);
	await expect(page.getByText('Chorus', { exact: true })).toBeVisible();
	const root = page.locator('#root');
	await expect(root).toHaveScreenshot('text-prompt-study.png', screenshotOpts);

	await runRecorderEvents(page, undefined, tornChorusEvents.slice(0, 1));
	await expect(page.getByText('1/4')).toBeVisible();
	await expect(root).toHaveScreenshot('text-prompt-study-progress.png', screenshotOpts);

	await page.goto(`/study/${deckId}/list`);
	await expect(page.getByText('Vienna')).toBeVisible();
	await expect(root).toHaveScreenshot('text-prompt-list.png', screenshotOpts);
	await page.unrouteAll({ behavior: 'ignoreErrors' });
});
