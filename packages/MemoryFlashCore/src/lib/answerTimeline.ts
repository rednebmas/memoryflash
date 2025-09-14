import { Note } from 'tonal';
import { MultiSheetQuestion } from '../types/MultiSheetCard';
import { durationBeats } from './measure';

function arraysEqual(a: number[], b: number[]) {
	if (a.length !== b.length) return false;
	for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
	return true;
}

function collectSpans(q: MultiSheetQuestion) {
	type Span = { start: number; end: number; notes: number[] };
	const spans: Span[] = [];
	for (const v of q.voices) {
		let beat = 0;
		for (const s of v.stack) {
			const dur = durationBeats[s.duration];
			const start = beat;
			const end = beat + dur;
			if (!s.rest) {
				spans.push({
					start,
					end,
					notes: s.notes
						.map((n) => Note.midi(n.name + n.octave))
						.filter((n): n is number => typeof n === 'number')
						.sort((a, b) => a - b),
				});
			}
			beat = end;
		}
	}
	return spans;
}

export function questionToTimeline(question: MultiSheetQuestion): number[][] {
	const spans = collectSpans(question);
	const boundaries = Array.from(new Set(spans.flatMap((s) => [s.start, s.end]))).sort(
		(a, b) => a - b,
	);
	const timeline: number[][] = [];
	for (let i = 0; i < boundaries.length - 1; i++) {
		const start = boundaries[i];
		const active = spans
			.filter((s) => start >= s.start && start < s.end)
			.flatMap((s) => s.notes);
		const sorted = active.sort((a, b) => a - b);
		if (timeline.length === 0 || !arraysEqual(sorted, timeline[timeline.length - 1]))
			timeline.push(sorted);
	}
	return timeline;
}

export function notesForSlice(timeline: number[][], index: number): number[] {
	return timeline[index] ?? [];
}

export function computeTieSkipAdvance(
	timeline: number[][],
	currentIndex: number,
): { nextIndex: number; isCompleted: boolean } {
	const lastIndex = timeline.length - 1;
	let idx = currentIndex;
	const current = timeline[idx] ?? [];
	while (idx < lastIndex && arraysEqual(current, timeline[idx + 1] ?? [])) idx += 1;
	return { nextIndex: idx + 1, isCompleted: idx + 1 > lastIndex };
}
