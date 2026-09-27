export const SAX_TYPES = ['soprano', 'alto', 'tenor', 'baritone'] as const;
export type SaxType = (typeof SAX_TYPES)[number];

const SAX_TRANSPOSITION: Record<SaxType, number> = {
	soprano: 2,
	alto: 9,
	tenor: 14,
	baritone: 21,
};

const NATURAL_CHROMAS = [0, 2, 4, 5, 7, 9, 11];

const nearestNatural = (midi: number) => {
	const candidates = [-1, 0, 1, 2].map((offset) => Math.floor(midi) + offset);
	const naturals = candidates.filter((c) => NATURAL_CHROMAS.includes(((c % 12) + 12) % 12));
	return naturals.reduce((best, c) => (Math.abs(c - midi) < Math.abs(best - midi) ? c : best));
};

export function frequencyToWrittenMidi(
	frequency: number,
	saxType: SaxType,
	naturalsOnly = false,
): number {
	const midi = 69 + 12 * Math.log2(frequency / 440) + SAX_TRANSPOSITION[saxType];
	return naturalsOnly ? nearestNatural(midi) : Math.round(midi);
}

export const FRAME_MS = 1000 / 60;
export const DEFAULT_HOLD_MS = 250;
export const SAX_HOLD_OPTIONS_MS = [250, 500, 750, 1000, 1500];
const holdFrames = (holdMs: number) => Math.max(1, Math.round(holdMs / FRAME_MS));
const GRACE_FRAMES = 4;
const OFF_FRAMES = 8;

export type PitchState = {
	candidate?: number;
	streak: number;
	strays: number;
	active?: number;
	misses: number;
};
export type PitchStep = { state: PitchState; on?: number; off?: number };

export const initialPitchState: PitchState = { streak: 0, strays: 0, misses: 0 };

const trackCandidate = (prev: PitchState, midi?: number) => {
	if (midi === prev.candidate) return { candidate: midi, streak: prev.streak + 1, strays: 0 };
	if (prev.candidate !== undefined && prev.strays + 1 < GRACE_FRAMES) {
		return { ...prev, strays: prev.strays + 1 };
	}
	return { candidate: midi, streak: midi === undefined ? 0 : 1, strays: 0 };
};

export function stabilizePitch(
	prev: PitchState,
	midi?: number,
	holdMs = DEFAULT_HOLD_MS,
): PitchStep {
	const misses = midi === prev.active ? 0 : prev.misses + 1;
	const state = { ...trackCandidate(prev, midi), active: prev.active, misses };
	const { candidate } = state;
	if (
		candidate !== undefined &&
		candidate !== prev.active &&
		state.streak >= holdFrames(holdMs)
	) {
		return {
			state: { ...state, active: candidate, misses: 0 },
			on: candidate,
			off: prev.active,
		};
	}
	if (prev.active !== undefined && misses >= OFF_FRAMES) {
		return { state: { ...state, active: undefined, misses: 0 }, off: prev.active };
	}
	return { state };
}

export function holdProgress(
	{ candidate, streak, active }: PitchState,
	holdMs = DEFAULT_HOLD_MS,
): number {
	if (candidate === undefined) return 0;
	if (candidate === active) return 1;
	return Math.min(streak / holdFrames(holdMs), 1);
}
