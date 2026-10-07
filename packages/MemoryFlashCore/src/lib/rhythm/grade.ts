import { Grid, RhythmStrictness, ROLL_WINDOW_MS, TIERS_MS, TimedNote, TimingTier } from './types';

export const snapAnchor = (onsetMs: number, { originMs, beatMs }: Grid): number =>
	originMs + Math.round((onsetMs - originMs) / beatMs) * beatMs;

export const anchorFor = (onsetMs: number, grid: Grid, strictness: RhythmStrictness) => {
	const snapped = snapAnchor(onsetMs, grid);
	return tierFor(onsetMs - snapped, strictness) === 'miss' ? onsetMs : snapped;
};

export const expectedMs = (anchorMs: number, beat0: number, beat: number, beatMs: number) =>
	anchorMs + (beat - beat0) * beatMs;

export function tierFor(offsetMs: number, strictness: RhythmStrictness): TimingTier {
	const limits = TIERS_MS[strictness];
	const abs = Math.abs(offsetMs);
	if (abs <= limits.perfect) return 'perfect';
	if (abs <= limits.good) return 'good';
	if (abs <= limits.ok) return 'ok';
	return 'miss';
}

export const deadlineMs = (expected: number, strictness: RhythmStrictness) =>
	expected + TIERS_MS[strictness].ok + ROLL_WINDOW_MS;

export function chordOnset(
	notes: TimedNote[],
	sinceMs: number,
): { onsetMs: number; spreadMs: number } | null {
	const times = notes.map((n) => n.time).filter((t) => t > sinceMs);
	if (times.length === 0) return null;
	const onsetMs = Math.min(...times);
	return { onsetMs, spreadMs: Math.max(...times) - onsetMs };
}

export const isRollTooSlow = (spreadMs: number) => spreadMs > ROLL_WINDOW_MS;
