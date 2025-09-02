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

const events = [
	[54, 69, 73],
	[],
	[54, 69, 73],
	[],
	[54, 69, 73],
	[],
	[54, 69, 73],
	[],
	[54, 69, 73],
	[],
	[54, 69, 73],
	[],
	[54, 69, 73],
	[],
	[54, 69, 73],
	[],
];

test('Study cross-clef tied chord', async ({ page }) => {
	await initDeterministicEnv(page);
	await seedTestData(page);
	await uiLogin(page, 't@example.com', 'Testing123!');
	const courseId = await createCourse(page, 'My Test Course');
	const deckId = await createDeck(page, courseId, 'My Deck');
	await page.waitForURL(new RegExp(`/study/${deckId}/notation`));
	await page.getByLabel('Count').fill('2');
	await runRecorderEvents(page, `/study/${deckId}/notation`, events);
	await page.getByRole('button', { name: 'Add Card' }).click();
	await page.goto(`/study/${deckId}`);
	await page.locator('.card-container').first().waitFor();
	await runRecorderEvents(page, undefined, events, 'custom-deck-notation-cross-clef-tie-study');
	const incorrect = await page.evaluate(
		() => (window as any).store.getState().scheduler.incorrect,
	);
	expect(incorrect).toBeFalsy();
	await page.unrouteAll({ behavior: 'ignoreErrors' });
});
