import { Note } from 'tonal';
import { MultiSheetCard, MultiSheetQuestion } from '../types/MultiSheetCard';
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

export function buildScoreTimeline(question: MultiSheetQuestion): ScoreTimeline {
	const events: NoteEvent[] = [];
	question.voices.forEach((v, voice) => {
		let beat = 0;
		v.stack.forEach((s) => {
			const len = durationBeats[s.duration];
			s.notes.forEach((n) => {
				const midi = Note.midi(n.name + n.octave);
				if (typeof midi === 'number')
					events.push({
						midi,
						voice,
						start: beat,
						end: beat + len,
					});
			});
			beat += len;
		});
	});
	const beats = Array.from(new Set(events.flatMap((e) => [e.start, e.end]).concat(0))).sort(
		(a, b) => a - b,
	);

	return { events, beats };
}

export function activeNotesAt(t: ScoreTimeline, index: number): NoteEvent[] {
	const beat = t.beats[index];
	return t.events.filter((e) => e.start <= beat && beat < e.end).sort((a, b) => a.midi - b.midi);
}

export function arraysEqual(a: number[], b: number[]): boolean {
	if (a.length !== b.length) return false;
	for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
	return true;
}

export function midisInArraysEqual(a: NoteEvent[], b: NoteEvent[]): boolean {
	return arraysEqual(
		a.map((e) => e.midi),
		b.map((e) => e.midi),
	);
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
		if (midisInArraysEqual(curr, next)) idx += 1;
		else return { nextIndex: idx + 1, isCompleted: false };
	}
	return { nextIndex: idx, isCompleted: true };
}
