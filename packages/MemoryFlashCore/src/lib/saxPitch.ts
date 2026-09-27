export const SAX_TYPES = ['soprano', 'alto', 'tenor', 'baritone'] as const;
export type SaxType = (typeof SAX_TYPES)[number];

const SAX_TRANSPOSITION: Record<SaxType, number> = {
	soprano: 2,
	alto: 9,
	tenor: 14,
	baritone: 21,
};

export function frequencyToWrittenMidi(frequency: number, saxType: SaxType): number {
	return Math.round(69 + 12 * Math.log2(frequency / 440)) + SAX_TRANSPOSITION[saxType];
}

const ON_FRAMES = 5;
const OFF_FRAMES = 8;

export type PitchState = { candidate?: number; streak: number; active?: number; misses: number };
export type PitchStep = { state: PitchState; on?: number; off?: number };

export const initialPitchState: PitchState = { streak: 0, misses: 0 };

export function stabilizePitch(prev: PitchState, midi?: number): PitchStep {
	const streak = midi === prev.candidate ? prev.streak + 1 : 1;
	const misses = midi === prev.active ? 0 : prev.misses + 1;
	const state = { candidate: midi, streak, active: prev.active, misses };
	if (midi !== undefined && midi !== prev.active && streak >= ON_FRAMES) {
		return { state: { ...state, active: midi, misses: 0 }, on: midi, off: prev.active };
	}
	if (prev.active !== undefined && misses >= OFF_FRAMES) {
		return { state: { ...state, active: undefined, misses: 0 }, off: prev.active };
	}
	return { state };
}
