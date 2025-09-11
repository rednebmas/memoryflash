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

const fm = [54, 66, 69, 73];
const a = [57, 64, 69, 73];
const events = [fm, fm, a, a];

test('Study cross-clef tied chord', async ({ page }) => {
	await initDeterministicEnv(page);
	await seedTestData(page);
	await uiLogin(page, 't@example.com', 'Testing123!');
	const courseId = await createCourse(page, 'My Test Course');
	const deckId = await createDeck(page, courseId, 'My Deck');
	await page.waitForURL(new RegExp(`/study/${deckId}/notation`));
	await page.getByLabel('Key').selectOption('E');
	await page.getByLabel('Count').fill('1');
	await page.getByLabel('Treble').selectOption('h');
	await page.getByLabel('Bass').selectOption('h');
	await runRecorderEvents(
		page,
		undefined,
		events,
		'custom-deck-notation-cross-clef-tie-notation-input',
		async (index) => {
			if (index === 0) {
				// After first fm chord, change to 8ths for second fm
				await page.getByLabel('Treble').selectOption('8');
				await page.getByLabel('Bass').selectOption('8');
			} else if (index === 1) {
				// After second fm chord, change to quarters for first a
				await page.getByLabel('Treble').selectOption('q');
				await page.getByLabel('Bass').selectOption('q');
			} else if (index === 2) {
				// After first a chord, change back to 8ths for second a
				await page.getByLabel('Treble').selectOption('8');
				await page.getByLabel('Bass').selectOption('8');
			}
		},
	);

	await page.getByRole('button', { name: 'Add Card' }).click();
	await page.goto(`/study/${deckId}`);
	await page.locator('.card-container').first().waitFor();
	await runRecorderEvents(page, undefined, [fm, a], 'custom-deck-notation-cross-clef-tie-study');
	const incorrect = await page.evaluate(
		() => (window as any).store.getState().scheduler.incorrect,
	);
	expect(incorrect).toBeFalsy();
	await page.unrouteAll({ behavior: 'ignoreErrors' });
});
