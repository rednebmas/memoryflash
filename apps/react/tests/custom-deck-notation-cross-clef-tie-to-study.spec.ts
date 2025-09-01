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
const question = {
	key: 'F#m',
	voices: [
		{
			staff: 'Treble',
			stack: [
				{
					notes: [
						{ name: 'A', octave: 4 },
						{ name: 'C#', octave: 5 },
					],
					duration: 'h',
				},
				{
					notes: [
						{ name: 'A', octave: 4 },
						{ name: 'C#', octave: 5 },
					],
					duration: 'h',
				},
				{
					notes: [
						{ name: 'A', octave: 4 },
						{ name: 'C#', octave: 5 },
					],
					duration: 'h',
				},
				{ notes: [], rest: true, duration: 'h' },
			],
		},
		{
			staff: 'Bass',
			stack: [
				{ notes: [{ name: 'F#', octave: 3 }], duration: 'h' },
				{ notes: [{ name: 'F#', octave: 3 }], duration: 'h' },
				{ notes: [{ name: 'F#', octave: 3 }], duration: 'h' },
				{ notes: [], rest: true, duration: 'h' },
			],
		},
	],
};

const studyEvents = [[54, 69, 73], [], [54, 69, 73], [], [54, 69, 73], [], [], []];

test('Study cross-clef tied chord', async ({ page }) => {
	await initDeterministicEnv(page);
	await seedTestData(page);
	await uiLogin(page, 't@example.com', 'Testing123!');

	const courseId = await createCourse(page, 'My Test Course');
	const deckId = await createDeck(page, courseId, 'My Deck');

	const res = await page.request.post(`http://localhost:3333/decks/${deckId}/cards`, {
		data: { questions: [question] },
	});
	expect(res.ok()).toBeTruthy();

	await page.goto(`/study/${deckId}`);
	await page.locator('.card-container').first().waitFor();
	await runRecorderEvents(page, undefined, studyEvents);

	const incorrect = await page.evaluate(
		() => (window as any).store.getState().scheduler.incorrect,
	);
	expect(incorrect).toBeFalsy();

	await page.unrouteAll({ behavior: 'ignoreErrors' });
});
