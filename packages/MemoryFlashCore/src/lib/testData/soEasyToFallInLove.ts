import { AnswerType, CardTypeEnum, StaffEnum } from '../../types/Cards';
import { questionsForAllMajorKeys } from '../multiKeyTransposer';
import { SheetCard } from '../transpositionGroups';
import { MultiSheetQuestion, StackedNotes } from '../../types/MultiSheetCard';

export const chord = (
	names: string[],
	duration: StackedNotes['duration'],
	extra: Partial<StackedNotes> = {},
): StackedNotes => ({
	notes: names.map((n) => ({ name: n.slice(0, -1), octave: Number(n.slice(-1)) })),
	duration,
	...extra,
});

export const sheetQuestion = (stack: StackedNotes[], key = 'C'): MultiSheetQuestion => ({
	key,
	voices: [{ staff: StaffEnum.Treble, stack }],
});

const TIED = [0, 1, 2];

const progression = (key: string, [a, b, c, d]: string[][]) =>
	sheetQuestion(
		[
			chord(a, 'w'),
			chord(b, 'h'),
			chord(c, 'h'),
			chord(a, 'h', { tie: { toNext: TIED } }),
			chord(a, 'q', { tie: { fromPrevious: TIED } }),
			chord(d, 'q'),
			chord(b, 'h'),
			chord(c, 'h'),
		],
		key,
	);

// Sam's prod cards (deck 6abddc2b9995af0775581968), right hand only
export const soEasyC = progression('C', [
	['F3', 'A3', 'C4'],
	['E3', 'G3', 'B3'],
	['E3', 'G3', 'Bb3'],
	['F3', 'A3', 'B3'],
]);

export const soEasyBb = progression('Bb', [
	['Eb4', 'G4', 'Bb4'],
	['D4', 'F4', 'A4'],
	['D4', 'F4', 'Ab4'],
	['Eb4', 'G4', 'A4'],
]);

// Sam's real chord names; the bass of F/G is not in the right-hand voicing
export const soEasyNamesC = ['F/G', 'Cmaj7', 'C#dim7', 'F/G', 'G9', 'Cmaj7', 'C#dim7'];
export const soEasyNamesEb = ['Ab/Bb', 'Ebmaj7', 'Edim7', 'Ab/Bb', 'Bb9', 'Ebmaj7', 'Edim7'];
export const soEasyNumerals = 'IV/V – Imaj7 – ♯i°7 – IV/V – V9 – Imaj7 – ♯i°7';

// Sam's 12 prod cards are exactly the transposer's output from the C card
export const soEasyDeck = (transpositionGroup?: string): SheetCard[] =>
	questionsForAllMajorKeys(soEasyC, 'C3', 'C5')
		.slice(0, 12)
		.map((question) => ({
			_id: question.key,
			uid: `custom-d1-${question.key}`,
			deckId: 'd1',
			type: CardTypeEnum.MultiSheet,
			question: { ...question, presentationModes: [{ id: 'Sheet Music' }] },
			answer: { type: AnswerType.ExactMulti },
			createdAt: new Date(0),
			updatedAt: new Date(0),
			...(transpositionGroup ? { transpositionGroup } : {}),
		}));
