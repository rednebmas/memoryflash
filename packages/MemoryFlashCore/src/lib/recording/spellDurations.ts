import { createRestDurations, Duration } from '../measure';
import { NoteTie, SheetNote, StackedNotes } from '../../types/MultiSheetCard';

const SPELLINGS: [number, Duration][] = [
	[4, 'w'],
	[3, 'hd'],
	[2, 'h'],
	[1.5, 'qd'],
	[1, 'q'],
	[0.75, '8d'],
	[0.5, '8'],
	[0.25, '16'],
];

export function spellBeats(beats: number): Duration[] {
	const result: Duration[] = [];
	let left = beats;
	for (const [value, duration] of SPELLINGS) {
		while (left >= value - 1e-9) {
			result.push(duration);
			left -= value;
		}
	}
	return result;
}

const tieFor = (index: number, total: number, size: number): NoteTie | undefined => {
	if (total === 1) return undefined;
	const all = Array.from({ length: size }, (_, i) => i);
	return {
		fromPrevious: index > 0 ? all : undefined,
		toNext: index < total - 1 ? all : undefined,
	};
};

/** Rests are split at beat boundaries and never dotted, as rests are usually written. */
export function spellRest(startBeat: number, beats: number): StackedNotes[] {
	const end = startBeat + beats;
	const firstBeat = Math.min(end, Math.ceil(startBeat - 1e-9));
	const lastBeat = Math.max(firstBeat, Math.floor(end + 1e-9));
	return [firstBeat - startBeat, lastBeat - firstBeat, end - lastBeat]
		.filter((b) => b > 1e-9)
		.flatMap(createRestDurations);
}

export function spellNote(notes: SheetNote[], pieces: number[]): StackedNotes[] {
	const durations = pieces.flatMap(spellBeats);
	return durations.map((duration, i) => {
		const tie = tieFor(i, durations.length, notes.length);
		return tie ? { notes, duration, tie } : { notes, duration };
	});
}
