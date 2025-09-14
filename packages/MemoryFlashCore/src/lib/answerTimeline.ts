import { Note } from 'tonal';
import { MultiSheetQuestion, StackedNotes } from '../types/MultiSheetCard';
import { durationBeats, Duration } from './measure';

type NoteProjection = number[];

function beatsToDuration(beats: number): Duration {
	const match = (Object.keys(durationBeats) as Duration[]).find(
		(d) => Math.abs(durationBeats[d] - beats) < 1e-9,
	);
	if (!match) throw new Error(`Unsupported beat length: ${beats}`);
	return match;
}

export function questionToTimeline(question: MultiSheetQuestion): StackedNotes[] {
	const boundaries = new Set<number>();
	for (const v of question.voices) {
		let beat = 0;
		for (const s of v.stack) {
			boundaries.add(beat);
			beat += durationBeats[s.duration];
		}
		boundaries.add(beat);
	}
	const points = Array.from(boundaries).sort((a, b) => a - b);
	const timeline: StackedNotes[] = [];
	for (let i = 0; i < points.length - 1; i++) {
		const start = points[i];
		const end = points[i + 1];
		const notes = question.voices.flatMap((v) => {
			let beat = 0;
			for (const s of v.stack) {
				const dur = durationBeats[s.duration];
				const next = beat + dur;
				if (start >= beat && start < next) {
					return s.rest ? [] : s.notes;
				}
				beat = next;
			}
			return [];
		});
		timeline.push({
			notes,
			duration: beatsToDuration(end - start),
			rest: notes.length === 0 || undefined,
		});
	}
	return timeline;
}

export function notesForSlice(timeline: StackedNotes[], index: number): number[] {
	return (timeline[index]?.notes ?? [])
		.map((n) => Note.midi(n.name + n.octave))
		.filter((n): n is number => typeof n === 'number')
		.sort((a, b) => a - b);
}

function arraysEqual(a: number[], b: number[]) {
	if (a.length !== b.length) return false;
	for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
	return true;
}

export function computeTieSkipAdvance(
	timeline: StackedNotes[],
	currentIndex: number,
	project: (idx: number) => NoteProjection,
): { nextIndex: number; isCompleted: boolean } {
	const lastIndex = timeline.length - 1;
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

export type { NoteProjection };
