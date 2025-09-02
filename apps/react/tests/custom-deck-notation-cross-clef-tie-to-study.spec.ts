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
	await page.evaluate((ns) => { const dispatch = (window as any).store.dispatch; for (const n of ns) dispatch({ type: 'midi/addNote', payload: n }); }, fm);
	await page.waitForTimeout(0);
	await page.evaluate((ns) => { const dispatch = (window as any).store.dispatch; for (const n of ns) dispatch({ type: 'midi/removeNote', payload: n }); }, fm);

	await page.getByLabel('Treble').selectOption('8');
	await page.getByLabel('Bass').selectOption('8');
	await page.evaluate((ns) => { const dispatch = (window as any).store.dispatch; for (const n of ns) dispatch({ type: 'midi/addNote', payload: n }); }, fm);
	await page.waitForTimeout(0);
	await page.evaluate((ns) => { const dispatch = (window as any).store.dispatch; for (const n of ns) dispatch({ type: 'midi/removeNote', payload: n }); }, fm);

	await page.getByLabel('Treble').selectOption('q');
	await page.getByLabel('Bass').selectOption('q');
	await page.evaluate((ns) => { const dispatch = (window as any).store.dispatch; for (const n of ns) dispatch({ type: 'midi/addNote', payload: n }); }, a);
	await page.waitForTimeout(0);
	await page.evaluate((ns) => { const dispatch = (window as any).store.dispatch; for (const n of ns) dispatch({ type: 'midi/removeNote', payload: n }); }, a);

	await page.getByLabel('Treble').selectOption('8');
	await page.getByLabel('Bass').selectOption('8');
	await page.evaluate((ns) => { const dispatch = (window as any).store.dispatch; for (const n of ns) dispatch({ type: 'midi/addNote', payload: n }); }, a);
	await page.waitForTimeout(0);
	await page.evaluate((ns) => { const dispatch = (window as any).store.dispatch; for (const n of ns) dispatch({ type: 'midi/removeNote', payload: n }); }, a);

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
