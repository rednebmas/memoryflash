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

export interface ChordState {
	startNotes: number[];
	carryNotes: number[];
	releaseNotes: number[];
}

const baseDurations: Record<string, number> = {
	'16': 0.25,
	'8': 0.5,
	q: 1,
	h: 2,
	w: 4,
};

function parseDuration(d: string): number {
	const dotted = d.endsWith('d');
	const base = baseDurations[dotted ? d.slice(0, -1) : d] ?? 0;
	return dotted ? base * 1.5 : base;
}

interface NoteEvent {
	midi: number;
	start: number;
	end: number;
}

function voiceEvents(voice: MultiSheetCard['question']['voices'][number]): NoteEvent[] {
	let time = 0;
	const events: NoteEvent[] = [];
	for (const part of voice.stack) {
		const dur = parseDuration(part.duration);
		if (!part.rest) {
			for (const n of part.notes ?? []) {
				const midi = Note.midi(n.name + n.octave);
				if (typeof midi === 'number') events.push({ midi, start: time, end: time + dur });
			}
		}
		time += dur;
	}
	return events;
}

export function buildNoteTimeline(card: MultiSheetCard): ChordState[] {
	const events = card.question.voices.flatMap(voiceEvents);
	const times = Array.from(new Set(events.flatMap((e) => [e.start, e.end]))).sort(
		(a, b) => a - b,
	);
	return times.slice(0, -1).map((t, i) => {
		const next = times[i + 1];
		const startNotes = events
			.filter((e) => e.start === t)
			.map((e) => e.midi)
			.sort((a, b) => a - b);
		const carryNotes = events
			.filter((e) => e.start < t && e.end > t)
			.map((e) => e.midi)
			.sort((a, b) => a - b);
		const releaseNotes = events
			.filter((e) => e.end === next)
			.map((e) => e.midi)
			.sort((a, b) => a - b);
		return { startNotes, carryNotes, releaseNotes };
	});
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
