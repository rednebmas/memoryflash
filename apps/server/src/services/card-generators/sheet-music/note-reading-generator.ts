import { Note } from 'tonal';
import { AnswerType, CardTypeEnum, StaffEnum } from 'MemoryFlashCore/src/types/Cards';
import { DeckWithoutGeneratedFields as IDeck } from 'MemoryFlashCore/src/types/Deck';
import { MultiSheetCard } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { findOrCreateSystemCourse, upsertCourse } from '../upsert-course';

type Staff = StaffEnum.Treble | StaffEnum.Bass;
type StaffNote = { staff: Staff; note: string };
type Level = { section: string; name: string; notes: StaffNote[] };

const COURSE_NAME = 'Sheet Music';

const on = (staff: Staff, notes: string) => notes.split(' ').map((note) => ({ staff, note }));

const TREBLE_SPACES = on(StaffEnum.Treble, 'F4 A4 C5 E5');
const TREBLE_LINES = on(StaffEnum.Treble, 'E4 G4 B4 D5 F5');
const TREBLE_STAFF = [...TREBLE_SPACES, ...TREBLE_LINES];
const TREBLE_LEDGER = on(StaffEnum.Treble, 'G5 A5 B5 C6 D6 E6 F6 G6 D4 C4 B3 A3 G3 F3');
const BASS_SPACES = on(StaffEnum.Bass, 'A2 C3 E3 G3');
const BASS_LINES = on(StaffEnum.Bass, 'G2 B2 D3 F3 A3');
const BASS_STAFF = [...BASS_SPACES, ...BASS_LINES];
const BASS_LEDGER = on(StaffEnum.Bass, 'B3 C4 D4 E4 F4 G4 F2 E2 D2 C2 B1 A1 G1 F1');

export const noteReadingLevels: Level[] = [
	{ section: 'Treble Clef', name: 'FACE (Spaces)', notes: TREBLE_SPACES },
	{ section: 'Treble Clef', name: 'EGBDF (Lines)', notes: TREBLE_LINES },
	{ section: 'Treble Clef', name: 'All Lines & Spaces', notes: TREBLE_STAFF },
	{ section: 'Bass Clef', name: 'ACEG (Spaces)', notes: BASS_SPACES },
	{ section: 'Bass Clef', name: 'GBDFA (Lines)', notes: BASS_LINES },
	{ section: 'Bass Clef', name: 'All Lines & Spaces', notes: BASS_STAFF },
	{ section: 'Both Clefs', name: 'Both Clefs', notes: [...TREBLE_STAFF, ...BASS_STAFF] },
	{
		section: 'Ledger Lines',
		name: 'Treble Ledger Lines',
		notes: [...TREBLE_STAFF, ...TREBLE_LEDGER],
	},
	{ section: 'Ledger Lines', name: 'Bass Ledger Lines', notes: [...BASS_STAFF, ...BASS_LEDGER] },
	{
		section: 'Ledger Lines',
		name: 'Everything',
		notes: [...TREBLE_STAFF, ...TREBLE_LEDGER, ...BASS_STAFF, ...BASS_LEDGER],
	},
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

const toDeck = (courseId: string, level: Level): [IDeck, MultiSheetCard[]] => {
	const uid = `note reading ${level.section} ${level.name}`.toLowerCase();
	const deck = {
		uid,
		courseId,
		name: level.name,
		section: level.section,
		sectionSubtitle: '',
		tags: ['sheet music'],
	};
	return [deck, level.notes.map((n) => createNoteCard(uid, n))];
};

export const generateNoteReadingDecks = (courseId: string) =>
	noteReadingLevels.map((level) => toDeck(courseId, level));

export async function generateNoteReadingCourse() {
	const course = await findOrCreateSystemCourse(COURSE_NAME);
	return upsertCourse(course, generateNoteReadingDecks(course.id));
}
