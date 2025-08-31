import {
	test,
	expect,
	screenshotOpts,
	uiLogin,
	seedTestData,
	initDeterministicEnv,
	runRecorderEvents,
	createCourse,
	createDeck,
} from './helpers';

const chord = [56, 68];
const recordEvents = [chord, [], chord, [], chord, [], chord, []];
const studyEvents = [[68, 56], [], [68, 56], [], [68, 56], [], [68, 56], []];

// Ensure text prompt cards with cross-clef chords accept input when studying
test('Custom text prompt cross-clef card to study', async ({ page }) => {
	await initDeterministicEnv(page);
	await seedTestData(page);
	await uiLogin(page, 't@example.com', 'Testing123!');

	const courseId = await createCourse(page, 'My Test Course');
	const deckId = await createDeck(page, courseId, 'My Deck');
	await page.waitForURL(new RegExp(`/study/${deckId}/notation`));

	await page.locator('button:has-text("Sheet Music")').click();
	await page.getByRole('menuitem', { name: 'Text Prompt' }).click();
	await page.fill('#text-prompt', 'G# across clefs');

	await runRecorderEvents(page, undefined, recordEvents);
	const [addResp] = await Promise.all([
		page.waitForResponse(
			(r) => r.url().includes(`/decks/${deckId}/cards`) && r.request().method() === 'POST',
		),
		page.getByRole('button', { name: 'Add Card' }).click(),
	]);
	expect(addResp.ok()).toBeTruthy();

	await page.goto(`/study/${deckId}`);
	await page.locator('.card-container').first().waitFor();
	await runRecorderEvents(page, undefined, studyEvents);

	const incorrect = await page.evaluate(
		() => (window as any).store.getState().scheduler.incorrect,
	);
	expect(incorrect).toBeFalsy();

	const output = page.locator('#root');
	await expect(output).toHaveScreenshot(
		'custom-deck-text-to-study-cross-clef.png',
		screenshotOpts,
	);

	await page.unrouteAll({ behavior: 'ignoreErrors' });
});
