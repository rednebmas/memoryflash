import { MAX_RHYTHM_BPM } from './types';

export const LADDER_WINDOW = 8;
export const LADDER_CLEAN_TO_RISE = 7;
export const LADDER_MISSES_TO_DROP = 4;
export const LADDER_STEP_BPM = 5;

export type TempoLadder = { startBpm: number; bpm: number; recent: boolean[] };

export const resolveLadder = (ladder: TempoLadder | undefined, startBpm: number): TempoLadder =>
	ladder?.startBpm === startBpm ? ladder : { startBpm, bpm: startBpm, recent: [] };

const moveTo = (ladder: TempoLadder, bpm: number): TempoLadder => ({
	...ladder,
	bpm: Math.min(MAX_RHYTHM_BPM, Math.max(ladder.startBpm, bpm)),
	recent: [],
});

export function stepLadder(
	stored: TempoLadder | undefined,
	startBpm: number,
	attempt: { bpm: number; correct: boolean },
): TempoLadder {
	const ladder = resolveLadder(stored, startBpm);
	if (attempt.bpm !== ladder.bpm) return ladder;
	const recent = [...ladder.recent, attempt.correct].slice(-LADDER_WINDOW);
	const misses = recent.filter((clean) => !clean).length;
	if (misses >= LADDER_MISSES_TO_DROP) return moveTo(ladder, ladder.bpm - LADDER_STEP_BPM);
	if (recent.length === LADDER_WINDOW && recent.length - misses >= LADDER_CLEAN_TO_RISE) {
		return moveTo(ladder, ladder.bpm + LADDER_STEP_BPM);
	}
	return { ...ladder, recent };
}

export const LADDER_DESCRIPTION =
	`Speeds up ${LADDER_STEP_BPM} bpm after ${LADDER_CLEAN_TO_RISE} of ${LADDER_WINDOW} cards ` +
	`are in time, and slows down after ${LADDER_MISSES_TO_DROP} misses.`;
