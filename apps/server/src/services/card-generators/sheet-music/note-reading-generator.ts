import { Note } from 'tonal';
import { AnswerType, CardTypeEnum, StaffEnum } from 'MemoryFlashCore/src/types/Cards';
import { DeckWithoutGeneratedFields as IDeck } from 'MemoryFlashCore/src/types/Deck';
import { MultiSheetCard } from 'MemoryFlashCore/src/types/MultiSheetCard';
import Course from '../../../models/Course';
import { upsertCourse } from '../upsert-course';

type Staff = StaffEnum.Treble | StaffEnum.Bass;
type StaffNote = { staff: Staff; note: string };
type Level = { section: string; name: string; adds: StaffNote[] };

const COURSE_NAME = 'Sheet Music';

const on = (staff: Staff, notes: string[]) => notes.map((note) => ({ staff, note }));

const ledgerLevels = (section: string, staff: Staff, above: string[], below: string[]): Level[] =>
	Array.from({ length: Math.max(above.length, below.length) }, (_, i) => {
		const notes = [above[i], below[i]].filter(Boolean);
		return { section, name: notes.join(' & '), adds: on(staff, notes) };
	});

export const noteReadingLevels: Level[] = [
	{
		section: 'Treble Clef',
		name: 'FACE (Spaces)',
		adds: on(StaffEnum.Treble, ['F4', 'A4', 'C5', 'E5']),
	},
	{
		section: 'Treble Clef',
		name: 'EGBDF (Lines)',
		adds: on(StaffEnum.Treble, ['E4', 'G4', 'B4', 'D5', 'F5']),
	},
	{
		section: 'Bass Clef',
		name: 'ACEG (Spaces)',
		adds: on(StaffEnum.Bass, ['A2', 'C3', 'E3', 'G3']),
	},
	{
		section: 'Bass Clef',
		name: 'GBDFA (Lines)',
		adds: on(StaffEnum.Bass, ['G2', 'B2', 'D3', 'F3', 'A3']),
	},
	{ section: 'Bass Clef', name: 'Both Clefs', adds: [] },
	...ledgerLevels(
		'Treble Clef Ledger Lines',
		StaffEnum.Treble,
		['G5', 'A5', 'B5', 'C6', 'D6', 'E6', 'F6', 'G6'],
		['D4', 'C4', 'B3', 'A3', 'G3', 'F3'],
	),
	...ledgerLevels(
		'Bass Clef Ledger Lines',
		StaffEnum.Bass,
		['B3', 'C4', 'D4', 'E4', 'F4', 'G4'],
		['F2', 'E2', 'D2', 'C2', 'B1', 'A1', 'G1', 'F1'],
	),
	{ section: 'Review', name: 'Everything', adds: [] },
];

export function createNoteCard(deckUid: string, { staff, note }: StaffNote): MultiSheetCard {
	const { letter, acc, oct } = Note.get(note);
	return {
		uid: `${deckUid} ${staff} ${note}`,
		type: CardTypeEnum.MultiSheet,
		question: {
			key: 'C',
			voices: [
				{
					staff,
					stack: [{ notes: [{ name: letter + acc, octave: oct! }], duration: 'w' }],
				},
			],
			presentationModes: [{ id: 'Sheet Music' }],
		},
		answer: { type: AnswerType.ExactMulti },
	};
}

const toDeck = (courseId: string, level: Level, notes: StaffNote[]): [IDeck, MultiSheetCard[]] => {
	const uid = `note reading ${level.section} ${level.name}`.toLowerCase();
	const deck = {
		uid,
		courseId,
		name: level.name,
		section: level.section,
		sectionSubtitle: '',
		tags: ['sheet music'],
	};
	return [deck, notes.map((n) => createNoteCard(uid, n))];
};

export function generateNoteReadingDecks(courseId: string) {
	const learned: StaffNote[] = [];
	return noteReadingLevels.map((level) => {
		learned.push(...level.adds);
		const staff = level.adds[0]?.staff;
		return toDeck(
			courseId,
			level,
			staff ? learned.filter((n) => n.staff === staff) : [...learned],
		);
	});
}

export async function generateNoteReadingCourse() {
	const course =
		(await Course.findOne({ name: COURSE_NAME, userId: { $exists: false } })) ??
		new Course({ name: COURSE_NAME, decks: [] });
	return upsertCourse(course, generateNoteReadingDecks(course.id));
}
