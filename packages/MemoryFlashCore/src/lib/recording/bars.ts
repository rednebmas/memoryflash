import { StaffEnum } from '../../types/Cards';
import { MultiSheetQuestion, StackedNotes } from '../../types/MultiSheetCard';
import {
	beatsPerBarOf,
	createRestDurations,
	DEFAULT_BEATS_PER_BAR,
	durationBeats,
} from '../measure';

export type Bar = StackedNotes[];

export function splitStackIntoBars(stack: StackedNotes[], beatsPerBar: number): Bar[] {
	const bars: Bar[] = [];
	let beat = 0;
	stack.forEach((item) => {
		const bar = Math.floor(beat / beatsPerBar + 1e-9);
		while (bars.length <= bar) bars.push([]);
		bars[bar].push(item);
		beat += durationBeats[item.duration];
	});
	return bars;
}

const isNote = (item?: StackedNotes) => !!item && !item.rest && item.notes.length > 0;

/** Drops tie flags that no longer have a matching neighbour. */
export function normalizeTies(stack: StackedNotes[]): StackedNotes[] {
	return stack.map((item, i) => {
		if (!item.tie) return item;
		const toNext =
			isNote(stack[i + 1]) && stack[i + 1].tie?.fromPrevious ? item.tie.toNext : undefined;
		const fromPrevious =
			isNote(stack[i - 1]) && stack[i - 1].tie?.toNext ? item.tie.fromPrevious : undefined;
		const { tie: _, ...rest } = item;
		return toNext || fromPrevious ? { ...rest, tie: { toNext, fromPrevious } } : rest;
	});
}

export const restBar = (beatsPerBar: number): Bar => createRestDurations(beatsPerBar);

export const replaceBars = (bars: Bar[], from: number, take: Bar[]): Bar[] => {
	const padded = [...bars];
	while (padded.length < from) padded.push([]);
	return [...padded.slice(0, from), ...take, ...padded.slice(from + take.length)];
};

export const setBar = (bars: Bar[], index: number, bar: Bar) => replaceBars(bars, index, [bar]);
export const deleteBar = (bars: Bar[], index: number) => bars.filter((_, i) => i !== index);
export const insertBar = (bars: Bar[], index: number, beatsPerBar: number) => [
	...bars.slice(0, index),
	restBar(beatsPerBar),
	...bars.slice(index),
];

export function barsToQuestion(bars: Bar[], key: string, beatsPerBar: number): MultiSheetQuestion {
	const stack = normalizeTies(bars.flatMap((bar) => (bar.length ? bar : restBar(beatsPerBar))));
	const question: MultiSheetQuestion = { key, voices: [{ staff: StaffEnum.Treble, stack }] };
	return beatsPerBar === DEFAULT_BEATS_PER_BAR ? question : { ...question, beatsPerBar };
}

const hasNotes = (question: MultiSheetQuestion) =>
	question.voices.some((v) => v.stack.some(isNote));

/** Consecutive, non-overlapping segments of `size` bars; all-rest segments are dropped. */
export function segmentQuestion(question: MultiSheetQuestion, size: number): MultiSheetQuestion[] {
	const beatsPerBar = beatsPerBarOf(question);
	const barsByVoice = question.voices.map((v) => splitStackIntoBars(v.stack, beatsPerBar));
	const total = Math.max(0, ...barsByVoice.map((b) => b.length));
	const segments: MultiSheetQuestion[] = [];
	for (let from = 0; from < total; from += size) {
		const voices = question.voices.map((voice, v) => ({
			...voice,
			stack: normalizeTies(barsByVoice[v].slice(from, from + size).flat()),
		}));
		const segment = { ...question, voices };
		if (hasNotes(segment)) segments.push(segment);
	}
	return segments;
}

export const questionToBars = (question: MultiSheetQuestion): Bar[] => {
	const treble = question.voices.find((v) => v.staff === StaffEnum.Treble) ?? question.voices[0];
	return splitStackIntoBars(treble?.stack ?? [], beatsPerBarOf(question));
};

export const clearBar = (bars: Bar[], index: number, beatsPerBar: number) =>
	setBar(bars, index, restBar(beatsPerBar));
