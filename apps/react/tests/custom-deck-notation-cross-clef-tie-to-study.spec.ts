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
	[54, 66, 69, 73],
	[54, 66, 69, 73],
	[57, 64, 69, 73],
	[57, 64, 69, 73],
];

test('Study cross-clef tied chord', async ({ page }) => {
	await initDeterministicEnv(page);
	await seedTestData(page);
	await uiLogin(page, 't@example.com', 'Testing123!');
	const courseId = await createCourse(page, 'My Test Course');
	const deckId = await createDeck(page, courseId, 'My Deck');
	await page.waitForURL(new RegExp(`/study/${deckId}/notation`));
	await page.locator('label:has-text("Key") select').selectOption('E');
	const durs = ['h', '8', 'q', '8'];
	for (let i = 0; i < events.length; i++) {
		await page.locator('label:has-text("Treble") select').selectOption(durs[i]);
		await page.locator('label:has-text("Bass") select').selectOption(durs[i]);
		await runRecorderEvents(page, undefined, [events[i]]);
	}
	await page.getByRole('button', { name: 'Add Card' }).click();
	await page.goto(`/study/${deckId}`);
	await page.locator('.card-container').first().waitFor();
	await runRecorderEvents(page, undefined, events);
	const incorrect = await page.evaluate(
		() => (window as any).store.getState().scheduler.incorrect,
	);
	expect(incorrect).toBeFalsy();
	await page.unrouteAll({ behavior: 'ignoreErrors' });
});
