import { Note } from 'tonal';
import { MultiSheetQuestion, SheetNote } from '../types/MultiSheetCard';

export const NOTE_LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
export const ACCIDENTALS = ['b', '#'] as const;
export type Accidental = (typeof ACCIDENTALS)[number];

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
