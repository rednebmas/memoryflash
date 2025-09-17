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

const fmBass = [54];
const fmTreble = [66, 69, 73];
const aBass = [57];
const aTreble = [64, 69, 73];
const fm = [...fmBass, ...fmTreble];
const a = [...aBass, ...aTreble];
const notationEvents = [fmBass, fmTreble, fmBass, fmTreble, aBass, aTreble, aBass, aTreble];

test('Study cross-clef tied chord', async ({ page, clickButton }) => {
	await initDeterministicEnv(page);
	await seedTestData(page);
	await uiLogin(page, 't@example.com', 'Testing123!');
	const courseId = await createCourse(page, 'My Test Course');
	const deckId = await createDeck(page, courseId, 'My Deck');
	await page.waitForURL(new RegExp(`/study/${deckId}/notation`));
	await page.getByLabel('Key').selectOption('E');
	await page.getByLabel('Count').fill('1');

	await clickButton('h');
	await clickButton('+8');
	await runRecorderEvents(
		page,
		undefined,
		[fmTreble, aTreble],
		'custom-deck-notation-cross-clef-tie-treble-notation-input',
		async (index) => {
			if (index == 0) {
				await clickButton('q');
				await clickButton('+8');
			}
		},
	);

	await clickButton('h');
	await clickButton('+8');
	await clickButton('Bass');

	await runRecorderEvents(
		page,
		undefined,
		[fmBass, aBass],
		'custom-deck-notation-cross-clef-tie-bass-notation-input',
		async (index) => {
			if (index == 0) {
				await clickButton('q');
				await clickButton('+8');
			}
		},
	);

	await clickButton('Add Card');
	await page.goto(`/study/${deckId}`);
	await page.locator('.card-container').first().waitFor();
	await runRecorderEvents(page, undefined, [fm, a], 'custom-deck-notation-cross-clef-tie-study');
	const incorrect = await page.evaluate(
		() => (window as any).store.getState().scheduler.incorrect,
	);
	expect(incorrect).toBeFalsy();
	await page.unrouteAll({ behavior: 'ignoreErrors' });
});
