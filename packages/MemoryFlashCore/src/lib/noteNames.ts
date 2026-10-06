import { Midi, Note } from 'tonal';
import { majorKey } from '@tonaljs/key';
import { MultiSheetQuestion, SheetNote } from '../types/MultiSheetCard';

export const NOTE_LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
export const ACCIDENTALS = ['b', '#'] as const;
export type Accidental = (typeof ACCIDENTALS)[number];
export const PITCH_CLASS_NAMES = [
	['C'],
	['C♯', 'D♭'],
	['D'],
	['D♯', 'E♭'],
	['E'],
	['F'],
	['F♯', 'G♭'],
	['G'],
	['G♯', 'A♭'],
	['A'],
	['A♯', 'B♭'],
	['B'],
];
export const NOTE_NAME_PAD_ROOT = 60;

export function singleNote(question: MultiSheetQuestion): SheetNote | undefined {
	const notes = question.voices.flatMap((v) => v.stack.flatMap((s) => s.notes));
	return notes.length === 1 ? notes[0] : undefined;
}

export const singleNoteName = (question: MultiSheetQuestion) => singleNote(question)?.name;

export function singleNoteMidi(question: MultiSheetQuestion): number | undefined {
	const note = singleNote(question);
	return note ? (Note.midi(note.name + note.octave) ?? undefined) : undefined;
}

export const isSameNoteName = (answer: string, expected: string) =>
	Note.pitchClass(answer) === Note.pitchClass(expected);

export function midiToSheetNote(midi: number, key: string): SheetNote {
	const sharps = majorKey(key).alteration > 0;
	const name = Midi.midiToNoteName(midi, { sharps });
	const match = name.match(/([A-G][#b]?)(-?\d+)/);
	return { name: match?.[1] ?? 'C', octave: parseInt(match?.[2] ?? '4') };
}
