import { MultiSheetQuestion } from '../../types/MultiSheetCard';
import { buildScoreTimeline } from '../scoreTimeline';
import { COVERAGE_TIERS, PitchFrame, StepGrade, TimingTier } from './types';

export type NoteWindow = { index: number; startMs: number; endMs: number; midis: number[] };
type Grid = { anchorMs: number; beat0: number; beatMs: number };

const ANCHOR_MIN_FRAMES = 4;
const EARLY_SEARCH_MS = 150;

export function noteWindows(question: MultiSheetQuestion, grid: Grid): NoteWindow[] {
	const { events, beats } = buildScoreTimeline(question);
	const toMs = (beat: number) => grid.anchorMs + (beat - grid.beat0) * grid.beatMs;
	return beats.slice(0, -1).map((beat, index) => {
		const starting = events.filter((e) => e.start === beat);
		const end = Math.max(...starting.map((e) => e.end));
		return { index, startMs: toMs(beat), endMs: toMs(end), midis: starting.map((e) => e.midi) };
	});
}

export const firstBeat = (question: MultiSheetQuestion) => buildScoreTimeline(question).beats[0];

const coverageTier = (coverage: number): TimingTier => {
	if (coverage >= COVERAGE_TIERS.perfect) return 'perfect';
	if (coverage >= COVERAGE_TIERS.good) return 'good';
	if (coverage >= COVERAGE_TIERS.ok) return 'ok';
	return 'miss';
};

export type PitchMatch = (heard: number, expected: number) => boolean;
const exactMatch: PitchMatch = (heard, expected) => heard === expected;
export const chromaMatch: PitchMatch = (heard, expected) => (heard - expected) % 12 === 0;

const isMatch = ({ midi }: PitchFrame, midis: number[], match: PitchMatch) =>
	midi !== undefined && midis.some((m) => match(midi, m));

export function gradeCoverage(
	frames: PitchFrame[],
	window: NoteWindow,
	match: PitchMatch = exactMatch,
): StepGrade {
	const inside = frames.filter((f) => f.timeMs >= window.startMs && f.timeMs < window.endMs);
	const hits = inside.filter((f) => isMatch(f, window.midis, match)).length;
	const coverage = inside.length ? hits / inside.length : 0;
	const first = frames.find(
		(f) => f.timeMs >= window.startMs - EARLY_SEARCH_MS && isMatch(f, window.midis, match),
	);
	const offsetMs = first && first.timeMs < window.endMs ? first.timeMs - window.startMs : null;
	return {
		onsetMs: first?.timeMs ?? window.startMs,
		offsetMs: offsetMs === null ? null : Math.round(offsetMs),
		tier: coverageTier(coverage),
		coverage: Math.round(coverage * 100) / 100,
	};
}

export function findAnchorOnset(
	frames: PitchFrame[],
	midis: number[],
	match: PitchMatch = exactMatch,
): number | undefined {
	let run = 0;
	for (let i = 0; i < frames.length; i++) {
		run = isMatch(frames[i], midis, match) ? run + 1 : 0;
		if (run >= ANCHOR_MIN_FRAMES) return frames[i - run + 1].timeMs;
	}
	return undefined;
}
