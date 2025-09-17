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

const chords = [
	{ bass: [56], treble: [68] },
	{ bass: [48, 60], treble: [68] },
	{ bass: [56], treble: [68] },
	{ bass: [56], treble: [68] },
];
const recordEvents = chords.flatMap((chord) => [chord.bass, chord.treble]);
const studyEvents = chords.flatMap((chord) => [chord.bass, chord.treble]);

// Ensure text prompt cards with cross-clef chords accept input when studying
test('Custom text prompt cross-clef card to study', async ({ page, clickButton }) => {
	await initDeterministicEnv(page);
	await seedTestData(page);
	await uiLogin(page, 't@example.com', 'Testing123!');

	const courseId = await createCourse(page, 'My Test Course');
	const deckId = await createDeck(page, courseId, 'My Deck');
	await page.waitForURL(new RegExp(`/study/${deckId}/notation`));

	await page.locator('button:has-text("Sheet Music")').click();
	await page.getByRole('menuitem', { name: 'Text Prompt' }).click();
	await page.fill('#text-prompt', 'G# across clefs');

	await clickButton('Bass');
	await runRecorderEvents(page, undefined, recordEvents, undefined, async (index) => {
		if (index % 2 === 0) {
			await clickButton('Treble');
		} else if (index < recordEvents.length - 1) {
			await clickButton('Bass');
		}
	});
	const [addResp] = await Promise.all([
		page.waitForResponse(
			(r) => r.url().includes(`/decks/${deckId}/cards`) && r.request().method() === 'POST',
		),
		clickButton('Add Card'),
	]);
	expect(addResp.ok()).toBeTruthy();

	await page.goto(`/study/${deckId}`);
	await page.locator('.card-container').first().waitFor();
	await clickButton('Bass');
	await runRecorderEvents(
		page,
		undefined,
		studyEvents,
		'custom-text-prompt-cross-clef-study',
		async (index) => {
			if (index % 2 === 0) {
				await clickButton('Treble');
			} else if (index < studyEvents.length - 1) {
				await clickButton('Bass');
			}
		},
	);

	const incorrect = await page.evaluate(
		() => (window as any).store.getState().scheduler.incorrect,
	);
	expect(incorrect).toBeFalsy();

	await page.unrouteAll({ behavior: 'ignoreErrors' });
});
