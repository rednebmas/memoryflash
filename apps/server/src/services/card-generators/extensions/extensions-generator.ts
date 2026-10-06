import { Note } from 'tonal';
import { AnswerType, CardTypeEnum } from 'MemoryFlashCore/src/types/Cards';
import { DeckWithoutGeneratedFields as IDeck } from 'MemoryFlashCore/src/types/Deck';
import { MultiSheetCard, SheetNote } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { splitHands } from '../create-two-handed-cards-from-progressions';
import { findOrCreateSystemCourse, upsertCourse } from '../upsert-course';
import { ExtensionVoicing, VoicedChord, voiceAllRoots } from './extension-voicings';

type ExtensionDeck = ExtensionVoicing & {
	name: string;
	section: string;
	sectionSubtitle: string;
	prompt: string;
};
type Voicing = Omit<ExtensionDeck, 'name' | 'suffix'>;

const COURSE_NAME = 'Extensions';
const voicing = (
	degrees: number[],
	rhFloor: string,
	section: string,
	sectionSubtitle = '',
): Voicing => ({
	degrees,
	rhFloor,
	section,
	sectionSubtitle,
	prompt: `Root + ${degrees.join('-')}`,
});
const upper357 = voicing([3, 5, 7], 'G3', 'Sevenths: LH Root, RH 3-5-7');
const shell793 = voicing(
	[7, 9, 3],
	'F3',
	'Ninths: LH Root, RH 7-9-3',
	'A three-note Type B rootless voicing, without the 5th.',
);
const typeA = voicing(
	[3, 5, 7, 9],
	'F3',
	'Ninths: LH Root, RH 3-5-7-9 (Type A Rootless)',
	'Type A: the right hand stacks up from the 3rd and leaves the root to the left hand.',
);
const typeB = voicing(
	[7, 9, 3, 5],
	'F3',
	'Ninths: LH Root, RH 7-9-3-5 (Type B Rootless)',
	'Type B: the same four notes as Type A, stacked up from the 7th instead.',
);
const ninths = (v: Voicing): ExtensionDeck[] => [
	{ name: 'Dominant 9th', suffix: '9', ...v },
	{ name: 'Major 9th', suffix: 'maj9', ...v },
	{ name: 'Minor 9th', suffix: 'm9', ...v },
];

export const extensionDecks: ExtensionDeck[] = [
	{ name: 'Major 7th', suffix: 'maj7', ...upper357 },
	{ name: 'Minor 7th', suffix: 'm7', ...upper357 },
	{ name: 'Dominant 7th', suffix: '7', ...upper357 },
	{ name: 'Diminished 7th', suffix: 'dim7', ...upper357 },
	...ninths(shell793),
	...ninths(typeA),
	...ninths(typeB),
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
		sectionSubtitle: d.sectionSubtitle,
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
