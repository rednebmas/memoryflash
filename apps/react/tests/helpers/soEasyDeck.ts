import { Page } from '@playwright/test';
import { createCourse, createDeck } from './data';
import { API_URL } from './ports';

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

// Sam's real chord names for the C card
export const samsNames = ['F/G', 'Cmaj7', 'C#dim7', 'F/G', 'G9', 'Cmaj7', 'C#dim7'];

// MIDI notes that play the C card; add 10 for the Bb card
export const soEasyEvents = [
	[53, 57, 60],
	[52, 55, 59],
	[52, 55, 58],
	[53, 57, 60],
	[53, 57, 59],
	[52, 55, 59],
	[52, 55, 58],
];

export const seedSoEasyDeck = async (page: Page, course: string) => {
	const courseId = await createCourse(page, course);
	const deckId = await createDeck(page, courseId, 'So Easy');
	const res = await page.request.post(`${API_URL}/decks/${deckId}/cards`, {
		data: { questions: [cCard, bbCard] },
	});
	const { cards } = await res.json();
	return { deckId, cId: cards[0]._id as string };
};
