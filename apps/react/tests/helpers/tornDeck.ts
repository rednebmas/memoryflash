import { Page } from '@playwright/test';
import { createCourse, createDeck } from './data';
import { API_URL } from './ports';

const stack = (chords: string[][], duration = 'q') =>
	chords.map((names) => ({
		notes: names.map((n) => ({ name: n.slice(0, -1), octave: Number(n.slice(-1)) })),
		duration,
	}));

const prompt = (text: string, treble: string[][], bass: string[][]) => ({
	key: 'Eb',
	voices: [
		{ staff: 'Treble', stack: stack(treble) },
		{ staff: 'Bass', stack: stack(bass) },
	],
	presentationModes: [{ id: 'Text Prompt', text }],
});

// Copy of the Torn Chorus card in Sam's Covers deck, plus his other prompt formats
const treble = [
	['Bb3', 'D4', 'F4'],
	['C4', 'Eb4', 'G4'],
	['C4', 'Eb4', 'Ab4'],
	['Bb3', 'Eb4', 'G4'],
];
const bass = [['Bb2'], ['C3'], ['Ab2'], ['Eb3']];

export const tornChorusEvents = [
	[46, 58, 62, 65],
	[48, 60, 63, 67],
	[44, 60, 63, 68],
	[51, 58, 63, 67],
];

export const seedTornDeck = async (page: Page) => {
	const courseId = await createCourse(page, 'Covers');
	const deckId = await createDeck(page, courseId, 'Torn');
	const texts = ['Torn Chorus', '[Verse] Hotel California', '## Verse 1 • Part 1\n# Vienna'];
	const questions = texts.map((t) => prompt(t, treble, bass));
	await page.request.post(`${API_URL}/decks/${deckId}/cards`, { data: { questions } });
	return deckId;
};
