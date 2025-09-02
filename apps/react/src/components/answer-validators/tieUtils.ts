import { Note } from 'tonal';
import { MultiSheetCard } from 'MemoryFlashCore/src/types/MultiSheetCard';

export type NoteProjection = number[];

export function notesForPartExact(card: MultiSheetCard, index: number): number[] {
	const notes = card.question.voices
		.flatMap((voice) => voice.stack[index]?.notes ?? [])
		.map((n) => Note.midi(n.name + n.octave))
		.filter((n): n is number => typeof n === 'number');
	return notes.slice().sort((a, b) => a - b);
}

export function arraysEqual(a: number[], b: number[]) {
	if (a.length !== b.length) return false;
	for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
	return true;
}

export function computeTieSkipAdvance(
	card: MultiSheetCard,
	currentIndex: number,
	project: (idx: number) => NoteProjection,
): { nextIndex: number; isCompleted: boolean } {
	const lastIndex = card.question.voices[0].stack.length - 1;
	let idx = currentIndex;
	const current = project(idx);
	while (true) {
		if (idx >= lastIndex) return { nextIndex: idx, isCompleted: true };
		const next = project(idx + 1);
		if (arraysEqual(current, next)) {
			idx += 1;
			continue;
		}
		return { nextIndex: idx + 1, isCompleted: idx + 1 > lastIndex };
	}
}


