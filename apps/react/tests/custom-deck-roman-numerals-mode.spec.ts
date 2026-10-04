import { Page } from '@playwright/test';
import {
	test,
	expect,
	uiLogin,
	seedTestData,
	initDeterministicEnv,
	runRecorderEvents,
	createCourse,
	createDeck,
	setStaticScroll,
} from './helpers';
import { API_URL } from './helpers/ports';
import { screenshotOpts } from './helpers/screenshotOptions';

const chord = (names: string[], duration: string, tie?: object) => ({
	notes: names.map((n) => ({ name: n.slice(0, -1), octave: Number(n.slice(-1)) })),
	duration,
	...(tie ? { tie } : {}),
});

// Copy of the C card in Sam's "So Easy To Fall In Love" deck, and its Bb transposition
const progression = (key: string, [a, b, c, d]: string[][]) => ({
	key,
	voices: [
		{
			staff: 'Treble',
			stack: [
				chord(a, 'w'),
				chord(b, 'h'),
				chord(c, 'h'),
				chord(a, 'h', { toNext: [0, 1, 2] }),
				chord(a, 'q', { fromPrevious: [0, 1, 2] }),
				chord(d, 'q'),
				chord(b, 'h'),
				chord(c, 'h'),
			],
		},
	],
	presentationModes: [{ id: 'Sheet Music' }],
});

const cCard = progression('C', [
	['F3', 'A3', 'C4'],
	['E3', 'G3', 'B3'],
	['E3', 'G3', 'Bb3'],
	['F3', 'A3', 'B3'],
]);
const bbCard = progression('Bb', [
	['Eb4', 'G4', 'Bb4'],
	['D4', 'F4', 'A4'],
	['D4', 'F4', 'Ab4'],
	['Eb4', 'G4', 'A4'],
]);

const studyEvents = [
	[53, 57, 60],
	[52, 55, 59],
	[52, 55, 58],
	[53, 57, 60],
	[53, 57, 59],
	[52, 55, 59],
	[52, 55, 58],
];

const seedDeck = async (page: Page) => {
	const courseId = await createCourse(page, 'Roman Course');
	const deckId = await createDeck(page, courseId, 'So Easy');
	const res = await page.request.post(`${API_URL}/decks/${deckId}/cards`, {
		data: { questions: [cCard, bbCard] },
	});
	const { cards } = await res.json();
	return { deckId, cId: cards[0]._id as string };
};

test('Sheet music card studied in Roman Numerals mode with corrected chord names', async ({
	page,
	clickButton,
}) => {
	await page.setViewportSize({ width: 1366, height: 992 });
	await initDeterministicEnv(page);
	await seedTestData(page);
	await uiLogin(page, 't@example.com', 'Testing123!');
	const { deckId, cId } = await seedDeck(page);

	await page.goto(`/study/${deckId}/list`);
	await page.getByRole('button', { name: 'Card options' }).first().click();
	await page.getByRole('menuitem', { name: 'Edit card' }).click();
	await expect(page).toHaveURL(new RegExp(`/edit/${cId}`));
	await page.locator('button:has-text("Sheet Music")').first().click();
	await page.getByRole('menuitem', { name: 'Roman Numerals' }).click();
	await page.getByLabel('Chord 1 name').fill('Fmaj7');
	await page.getByLabel('Chord 3 name').fill('C7');
	await expect(page.getByText('Also update 1 transposed copy')).toBeVisible();
	await expect(page.getByText('IVmaj7 – iii – I7 – IV').first()).toBeVisible();
	await setStaticScroll(page);
	await expect(page.locator('#root')).toHaveScreenshot(
		'roman-numerals-editor.png',
		screenshotOpts,
	);

	const patches = new Map<
		string,
		{ question: { voices: { stack: { chordName?: string }[] }[] } }
	>();
	page.on('request', (r) => {
		if (r.method() === 'PATCH' && r.url().includes('/cards/'))
			patches.set(r.url().split('/').pop()!, r.postDataJSON());
	});
	await clickButton('Update Card');
	await expect(page.getByText('Card updated')).toBeVisible();
	expect(patches.size).toBe(2);
	const bbPatch = [...patches.entries()].find(([id]) => id !== cId)![1];
	expect(bbPatch.question.voices[0].stack[2].chordName).toBe('Bb7');

	await page.goto(`/study/${deckId}`);
	await expect(page.getByText(/^Key of/).first()).toBeVisible();
	const isC = await page.evaluate((id) => {
		const store = (window as any).store;
		const card = store.getState().cards.entities[store.getState().scheduler.currCard];
		return card._id === id;
	}, cId);
	const events = studyEvents.map((notes) => notes.map((n) => (isC ? n : n + 10)));
	await runRecorderEvents(page, undefined, events.slice(0, 1), 'roman-numerals-study');
	await runRecorderEvents(page, undefined, events.slice(1));
	const incorrect = await page.evaluate(
		() => (window as any).store.getState().scheduler.incorrect,
	);
	expect(incorrect).toBeFalsy();

	await page.unrouteAll({ behavior: 'ignoreErrors' });
});
