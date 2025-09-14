import { Note } from 'tonal';
import { MultiSheetCard } from '../types/MultiSheetCard';
import { durationBeats } from './measure';

export interface NoteEvent {
	midi: number;
	voice: number;
	start: number;
	end: number;
}

export interface ScoreTimeline {
	events: NoteEvent[];
	beats: number[];
}

export function buildScoreTimeline(card: MultiSheetCard): ScoreTimeline {
	const events: NoteEvent[] = [];
	card.question.voices.forEach((v, voice) => {
		let beat = 0;
		v.stack.forEach((s) => {
			const len = durationBeats[s.duration];
			s.notes.forEach((n) => {
				const midi = Note.midi(n.name + n.octave);
				if (typeof midi === 'number')
					events.push({ midi, voice, start: beat, end: beat + len });
			});
			beat += len;
		});
	});
	const beats = Array.from(new Set(events.flatMap((e) => [e.start, e.end]).concat(0))).sort(
		(a, b) => a - b,
	);
	return { events, beats };
}

export function activeNotesAt(t: ScoreTimeline, index: number): number[] {
	const beat = t.beats[index];
	return t.events
		.filter((e) => e.start <= beat && beat < e.end)
		.map((e) => e.midi)
		.sort((a, b) => a - b);
}

export function arraysEqual(a: number[], b: number[]): boolean {
	if (a.length !== b.length) return false;
	for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
	return true;
}

export function computeTieAdvance(
	t: ScoreTimeline,
	index: number,
): { nextIndex: number; isCompleted: boolean } {
	const last = t.beats.length - 2;
	let idx = index;
	const curr = activeNotesAt(t, idx);
	while (idx < last) {
		const next = activeNotesAt(t, idx + 1);
		if (arraysEqual(curr, next)) idx += 1;
		else return { nextIndex: idx + 1, isCompleted: false };
	}
	return { nextIndex: idx, isCompleted: true };
}
