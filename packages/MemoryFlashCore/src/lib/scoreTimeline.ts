import { Note } from 'tonal';
import { MultiSheetQuestion, StackedNotes } from '../types/MultiSheetCard';
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

type ContinuingNotes = (NoteEvent | undefined)[];

interface MergeResult {
	nextContinuing: ContinuingNotes;
	beatDelta: number;
}

const mergeStackEntry = (
	entry: StackedNotes,
	voice: number,
	beat: number,
	continuing: ContinuingNotes,
	events: NoteEvent[],
): MergeResult => {
	const len = durationBeats[entry.duration];
	const fromPrevious = new Set(entry.tie?.fromPrevious ?? []);
	const toNext = new Set(entry.tie?.toNext ?? []);
	if (entry.rest || entry.notes.length === 0) return { nextContinuing: [], beatDelta: len };
	const midiValues = entry.notes.map((n) => Note.midi(n.name + n.octave));
	const nextContinuing: ContinuingNotes = [];
	midiValues.forEach((midi, index) => {
		if (typeof midi !== 'number') return;
		let event: NoteEvent | undefined;
		if (fromPrevious.has(index)) {
			const prev = continuing[index];
			if (prev && prev.midi === midi) {
				prev.end = beat + len;
				event = prev;
			}
		}
		if (!event) {
			event = { midi, voice, start: beat, end: beat + len };
			events.push(event);
		}
		if (toNext.has(index)) nextContinuing[index] = event;
	});
	return { nextContinuing, beatDelta: len };
};

export function buildScoreTimeline(question: MultiSheetQuestion): ScoreTimeline {
	const events: NoteEvent[] = [];
	question.voices.forEach((voiceDef, voice) => {
		let beat = 0;
		let continuing: ContinuingNotes = [];
		voiceDef.stack.forEach((entry) => {
			const { beatDelta, nextContinuing } = mergeStackEntry(
				entry,
				voice,
				beat,
				continuing,
				events,
			);
			beat += beatDelta;
			continuing = nextContinuing;
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
