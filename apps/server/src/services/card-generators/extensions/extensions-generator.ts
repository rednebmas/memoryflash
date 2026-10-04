import { Note } from 'tonal';
import { AnswerType, CardTypeEnum } from 'MemoryFlashCore/src/types/Cards';
import { DeckWithoutGeneratedFields as IDeck } from 'MemoryFlashCore/src/types/Deck';
import { MultiSheetCard, SheetNote } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { splitHands } from '../create-two-handed-cards-from-progressions';
import { findOrCreateSystemCourse, upsertCourse } from '../upsert-course';
import { ExtensionVoicing, VoicedChord, voiceAllRoots } from './extension-voicings';

type ExtensionDeck = ExtensionVoicing & { name: string; section: string; prompt: string };

const COURSE_NAME = 'Extensions';
const SEVENTHS = 'Sevenths: LH Root, RH 3-5-7';
const NINTHS = 'Ninths: LH Root, RH 7-9-3 (Type B Rootless)';
const upper357 = { degrees: [3, 5, 7], rhFloor: 'G3', section: SEVENTHS, prompt: 'Root + 3-5-7' };
const typeB793 = { degrees: [7, 9, 3], rhFloor: 'F3', section: NINTHS, prompt: 'Root + 7-9-3' };

export const extensionDecks: ExtensionDeck[] = [
	{ name: 'Major 7th', suffix: 'maj7', ...upper357 },
	{ name: 'Minor 7th', suffix: 'm7', ...upper357 },
	{ name: 'Dominant 7th', suffix: '7', ...upper357 },
	{ name: 'Diminished 7th', suffix: 'dim7', ...upper357 },
	{ name: 'Dominant 9th', suffix: '9', ...typeB793 },
	{ name: 'Major 9th', suffix: 'maj9', ...typeB793 },
	{ name: 'Minor 9th', suffix: 'm9', ...typeB793 },
];

const toSheetNote = (note: string): SheetNote => {
	const { pc, oct } = Note.get(note);
	return { name: pc, octave: oct! };
};

export function createExtensionCard(
	deckUid: string,
	prompt: string,
	{ symbol, lh, rh }: VoicedChord,
): MultiSheetCard {
	const notes = [...lh, ...rh].map(toSheetNote);
	return {
		uid: `${symbol} ${deckUid}`,
		type: CardTypeEnum.MultiSheet,
		question: {
			key: 'C',
			voices: splitHands([{ notes, chordName: symbol, duration: 'w' }], lh.length),
			presentationModes: [
				{ id: 'Sheet Music w/ Chords' },
				{ id: 'Sheet Music' },
				{ id: 'First Chord Only', textAbove: prompt },
			],
		},
		answer: { type: AnswerType.ExactMulti },
	};
}

const toDeck = (courseId: string, d: ExtensionDeck): [IDeck, MultiSheetCard[]] => {
	const uid = `extensions ${d.suffix} ${d.degrees.join(' ')}`;
	const deck = {
		uid,
		courseId,
		name: d.name,
		section: d.section,
		sectionSubtitle: '',
		tags: ['both hands'],
	};
	return [deck, voiceAllRoots(d).map((chord) => createExtensionCard(uid, d.prompt, chord))];
};

export const generateExtensionDecks = (courseId: string) =>
	extensionDecks.map((d) => toDeck(courseId, d));

export async function generateExtensionsCourse() {
	const course = await findOrCreateSystemCourse(COURSE_NAME);
	return upsertCourse(course, generateExtensionDecks(course.id));
}
