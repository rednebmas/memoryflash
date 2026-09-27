import { Note } from 'tonal';
import { MultiSheetQuestion } from '../types/MultiSheetCard';

export const NOTE_LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
export const ACCIDENTALS = ['b', '#'] as const;
export type Accidental = (typeof ACCIDENTALS)[number];

export function singleNoteName(question: MultiSheetQuestion): string | undefined {
	const notes = question.voices.flatMap((v) => v.stack.flatMap((s) => s.notes));
	return notes.length === 1 ? notes[0].name : undefined;
}

export const isSameNoteName = (answer: string, expected: string) =>
	Note.pitchClass(answer) === Note.pitchClass(expected);
