export type BaseDuration = 'w' | 'h' | 'q' | '8' | '16' | '32' | '64';
export type Duration = BaseDuration | `${BaseDuration}d`;

export const durationBeats: Record<Duration, number> = {
	w: 4,
	wd: 6,
	h: 2,
	hd: 3,
	q: 1,
	qd: 1.5,
	'8': 0.5,
	'8d': 0.75,
	'16': 0.25,
	'16d': 0.375,
	'32': 0.125,
	'32d': 0.1875,
	'64': 0.0625,
	'64d': 0.09375,
};

import { SheetNote, StackedNotes } from '../types/MultiSheetCard';

const beatsToDurations: [number, BaseDuration][] = [
	[4, 'w'],
	[2, 'h'],
	[1, 'q'],
	[0.5, '8'],
	[0.25, '16'],
	[0.125, '32'],
	[0.0625, '64'],
];

export function createRestDurations(beats: number): StackedNotes[] {
	const result: StackedNotes[] = [];
	for (const [value, dur] of beatsToDurations) {
		while (beats >= value - 1e-9) {
			result.push({ notes: [], duration: dur, rest: true });
			beats -= value;
		}
	}
	return result;
}

/** Insert rests so each bar contains exactly the specified number of beats. */
export function insertRestsToFillBars(notes: StackedNotes[], beatsPerBar = 4): StackedNotes[] {
	const result: StackedNotes[] = [];
	let beatsInBar = 0;

	for (const note of notes) {
		const beats = durationBeats[note.duration];
		if (beatsInBar + beats > beatsPerBar) {
			const remaining = beatsPerBar - beatsInBar;
			if (remaining > 0) {
				result.push(...createRestDurations(remaining));
			}
			beatsInBar = 0;
		}
		result.push(note);
		beatsInBar += beats;
		if (beatsInBar === beatsPerBar) {
			beatsInBar = 0;
		}
	}

	if (beatsInBar > 0) {
		result.push(...createRestDurations(beatsPerBar - beatsInBar));
	}

	return result;
}
