import { StackedNotes } from '../../types/MultiSheetCard';
import { midiToSheetNote } from '../noteNames';
import { spellNote, spellRest } from './spellDurations';
import { splitStackIntoBars } from './bars';

export type RecordedNote = { midi: number; onMs: number; offMs: number };
export type QuantizeOptions = {
	originMs: number;
	beatMs: number;
	beatsPerBar: number;
	stepsPerBeat: number;
	key: string;
	/** Bar that the take starts in, relative to originMs; defaults to the first note's bar. */
	firstBar?: number;
};

type Span = { start: number; end: number; midis: number[] };

const toSpans = (notes: RecordedNote[], { originMs, beatMs, stepsPerBeat }: QuantizeOptions) => {
	const step = (ms: number) => Math.round(((ms - originMs) / beatMs) * stepsPerBeat);
	const byStart = new Map<number, Span>();
	notes.forEach(({ midi, onMs, offMs }) => {
		const start = step(onMs);
		const span = byStart.get(start) ?? { start, end: start, midis: [] };
		span.end = Math.max(span.end, step(offMs));
		if (!span.midis.includes(midi)) span.midis.push(midi);
		byStart.set(start, span);
	});
	const spans = Array.from(byStart.values()).sort((a, b) => a.start - b.start);
	return spans.map((span, i) => {
		const next = spans[i + 1]?.start ?? Infinity;
		return { ...span, end: Math.max(span.start + 1, Math.min(span.end, next)) };
	});
};

const splitAtBars = (start: number, end: number, stepsPerBar: number) => {
	const pieces: number[] = [];
	for (let pos = start; pos < end;) {
		const barEnd = (Math.floor(pos / stepsPerBar) + 1) * stepsPerBar;
		pieces.push(Math.min(end, barEnd) - pos);
		pos = Math.min(end, barEnd);
	}
	return pieces;
};

const spellSpan = (start: number, end: number, midis: number[] | null, opts: QuantizeOptions) => {
	const stepsPerBar = opts.beatsPerBar * opts.stepsPerBeat;
	const toBeats = (steps: number) => steps / opts.stepsPerBeat;
	const pieces = splitAtBars(start, end, stepsPerBar);
	if (midis) {
		const sheet = [...midis].sort((a, b) => a - b).map((m) => midiToSheetNote(m, opts.key));
		return spellNote(sheet, pieces.map(toBeats));
	}
	let pos = start;
	return pieces.flatMap((steps) => {
		const barPos = ((pos % stepsPerBar) + stepsPerBar) % stepsPerBar;
		pos += steps;
		return spellRest(toBeats(barPos), toBeats(steps));
	});
};

/** Quantizes a take to bars; bar 1 is the downbeat at or before the first note. */
export function quantizeToBars(notes: RecordedNote[], opts: QuantizeOptions): StackedNotes[][] {
	const spans = toSpans(notes, opts);
	if (spans.length === 0) return [];
	const stepsPerBar = opts.beatsPerBar * opts.stepsPerBeat;
	const firstBar = opts.firstBar ?? Math.floor(spans[0].start / stepsPerBar);
	const lastBar = Math.ceil(spans[spans.length - 1].end / stepsPerBar);
	const stack: StackedNotes[] = [];
	const push = (start: number, end: number, midis: number[] | null) =>
		stack.push(...spellSpan(start, end, midis, opts));
	let pos = firstBar * stepsPerBar;
	spans.forEach((span) => {
		if (span.start > pos) push(pos, span.start, null);
		push(span.start, span.end, span.midis);
		pos = span.end;
	});
	if (pos < lastBar * stepsPerBar) push(pos, lastBar * stepsPerBar, null);
	return splitStackIntoBars(stack, opts.beatsPerBar);
}
