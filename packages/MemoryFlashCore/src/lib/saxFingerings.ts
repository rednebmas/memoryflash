import { Note } from 'tonal';
import { StaffEnum } from '../types/Cards';
import { MultiSheetQuestion } from '../types/MultiSheetCard';

export type SaxKey =
	| 'octave'
	| 'L1'
	| 'bis'
	| 'L2'
	| 'L3'
	| 'R1'
	| 'R2'
	| 'R3'
	| 'palmD'
	| 'palmEb'
	| 'palmF'
	| 'sideE'
	| 'gSharp'
	| 'lowCSharp'
	| 'lowB'
	| 'lowBb'
	| 'lowEb'
	| 'lowC';

export const SAX_KEY_LABELS: Record<SaxKey, string> = {
	octave: 'Octave key',
	L1: 'Left 1',
	bis: 'Bis key',
	L2: 'Left 2',
	L3: 'Left 3',
	R1: 'Right 1',
	R2: 'Right 2',
	R3: 'Right 3',
	palmD: 'Palm D',
	palmEb: 'Palm E♭',
	palmF: 'Palm F',
	sideE: 'Side high E',
	gSharp: 'G♯ (left pinky)',
	lowCSharp: 'Low C♯ (left pinky)',
	lowB: 'Low B (left pinky)',
	lowBb: 'Low B♭ (left pinky)',
	lowEb: 'Low E♭ (right pinky)',
	lowC: 'Low C (right pinky)',
};

const LEFT: SaxKey[] = ['L1', 'L2', 'L3'];
const ALL: SaxKey[] = [...LEFT, 'R1', 'R2', 'R3'];
const PALM: SaxKey[] = ['octave', 'palmD', 'palmEb'];

const LOW_FINGERINGS: SaxKey[][] = [
	[...ALL, 'lowBb'],
	[...ALL, 'lowB'],
	[...ALL, 'lowC'],
	[...ALL, 'lowCSharp', 'lowC'],
	ALL,
	[...ALL, 'lowEb'],
	[...LEFT, 'R1', 'R2'],
	[...LEFT, 'R1'],
	[...LEFT, 'R2'],
	LEFT,
	[...LEFT, 'gSharp'],
	['L1', 'L2'],
	['L1', 'bis'],
	['L1'],
	['L2'],
	[],
];

const HIGH_FINGERINGS: SaxKey[][] = [
	['octave', 'palmD'],
	PALM,
	[...PALM, 'sideE'],
	[...PALM, 'palmF', 'sideE'],
];

const LOWEST_MIDI = Note.midi('Bb3')!;
const OCTAVE_START = LOWEST_MIDI + LOW_FINGERINGS.length;
const PALM_START = OCTAVE_START + 12;

export function saxFingering(note: string): SaxKey[] | undefined {
	const midi = Note.midi(note);
	if (midi == null || midi < LOWEST_MIDI) return undefined;
	if (midi < OCTAVE_START) return LOW_FINGERINGS[midi - LOWEST_MIDI];
	if (midi < PALM_START) return ['octave', ...LOW_FINGERINGS[midi - 12 - LOWEST_MIDI]];
	return HIGH_FINGERINGS[midi - PALM_START];
}

export type SaxNoteFingering = { note: string; keys: SaxKey[] | undefined };

export function saxFingeringsForQuestion(question: MultiSheetQuestion): SaxNoteFingering[] {
	const notes = question.voices
		.filter((v) => v.staff === StaffEnum.Treble)
		.flatMap((v) => v.stack.flatMap((s) => s.notes.map((n) => n.name + n.octave)));
	return Array.from(new Set(notes)).map((note) => ({ note, keys: saxFingering(note) }));
}
