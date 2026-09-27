import { z } from 'zod';

export const RHYTHM_STRICTNESS = ['tight', 'normal', 'loose'] as const;
export type RhythmStrictness = (typeof RHYTHM_STRICTNESS)[number];

export type TimingTier = 'perfect' | 'good' | 'ok' | 'miss';
export type TierLimits = { perfect: number; good: number; ok: number };

export const TIERS_MS: Record<RhythmStrictness, TierLimits> = {
	tight: { perfect: 25, good: 50, ok: 80 },
	normal: { perfect: 35, good: 70, ok: 120 },
	loose: { perfect: 50, good: 100, ok: 180 },
};

export const ROLL_WINDOW_MS = 150;
export const MIN_RHYTHM_BPM = 30;
export const MAX_RHYTHM_BPM = 240;

export const zRhythmSettings = z.object({
	enabled: z.boolean(),
	bpm: z.number().min(MIN_RHYTHM_BPM).max(MAX_RHYTHM_BPM),
	strictness: z.enum(RHYTHM_STRICTNESS),
});
export type RhythmSettings = z.infer<typeof zRhythmSettings>;

export const DEFAULT_RHYTHM: RhythmSettings = { enabled: false, bpm: 80, strictness: 'normal' };

export type Grid = { originMs: number; beatMs: number };
export type TimedNote = { number: number; time: number };
export type StepGrade = { onsetMs: number; offsetMs: number | null; tier: TimingTier };

export const RHYTHM_BPM_OPTIONS = Array.from({ length: 33 }, (_, i) => 40 + i * 5);

const capitalize = (s: string) => s[0].toUpperCase() + s.slice(1);

export const STRICTNESS_OPTIONS = RHYTHM_STRICTNESS.map((value) => {
	return { value, label: `${capitalize(value)} ±${TIERS_MS[value].ok}ms` };
});
