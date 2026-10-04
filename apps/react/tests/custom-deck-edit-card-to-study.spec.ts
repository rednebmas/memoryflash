import {
	test,
	expect,
	uiLogin,
	seedTestData,
	initDeterministicEnv,
	runRecorderEvents,
	createCourse,
	createDeck,
} from './helpers';

const events = [[72], [71], [67], [64]];

test('Edited sheet music card still renders in list and study', async ({ page, clickButton }) => {
	await initDeterministicEnv(page);
	await seedTestData(page);
	await uiLogin(page, 't@example.com', 'Testing123!');

	const courseId = await createCourse(page, 'Edit Course');
	const deckId = await createDeck(page, courseId, 'Edit Deck');
	await runRecorderEvents(page, `/study/${deckId}/notation`, events, undefined);
	await clickButton('Add Card');
	await expect(page.getByText('Card added')).toBeVisible();

	await page.goto(`/study/${deckId}/list`);
	await page.getByRole('button', { name: 'Card options' }).click();
	await page.getByRole('menuitem', { name: 'Edit card' }).click();
	await page.waitForURL(new RegExp(`/study/${deckId}/edit/`));
	const [patch] = await Promise.all([
		page.waitForResponse(
			(r) => r.url().includes('/cards/') && r.request().method() === 'PATCH',
		),
		clickButton('Update Card'),
	]);
	expect(patch.ok()).toBeTruthy();

	await page.goto(`/study/${deckId}/list`);
	await expect(page.locator('.card-container .svg-dark-mode svg').first()).toBeVisible();
	await page.goto(`/study/${deckId}`);
	await expect(page.locator('.card-container .svg-dark-mode svg').first()).toBeVisible();

	await page.unrouteAll({ behavior: 'ignoreErrors' });
});
