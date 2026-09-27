import { createSelector } from '@reduxjs/toolkit';
import { DEFAULT_RHYTHM, StepGrade, TIERS_MS } from '../../lib/rhythm/types';
import { deadlineMs, expectedMs } from '../../lib/rhythm/grade';
import { hasRhythm, stepBeats } from '../../lib/rhythm/stepBeats';
import { resolveLadder } from '../../lib/rhythm/tempoLadder';
import { beatsPerBarOf, DEFAULT_BEATS_PER_BAR } from '../../lib/measure';
import { CardTypeEnum } from '../../types/Cards';
import { ReduxState } from '../store';
import { currDeckStatsSelector } from './activeSchedulerSelector';
import { bpmSelector } from './attemptsStatsSelector';
import { chordInputModeSelector } from './chordInputModeSelector';
import { instrumentSelector } from './instrumentSelector';
import { sessionCardsSelector } from './scheduledCardsSelector';

export const deckRhythmSettingsSelector = createSelector(
	[currDeckStatsSelector],
	(stats) => stats?.rhythm ?? DEFAULT_RHYTHM,
);

export const deckLadderSelector = createSelector(
	[
		currDeckStatsSelector,
		deckRhythmSettingsSelector,
		(s: ReduxState) => s.rhythm.sessionLadder,
		(s: ReduxState) => s.scheduler.deck,
	],
	(stats, settings, session, deckId) => {
		const stored = session && session.deckId === deckId ? session.ladder : stats?.rhythmLadder;
		return resolveLadder(stored, settings.bpm);
	},
);

export const deckTempoSelector = createSelector([deckLadderSelector], (ladder) => ladder.bpm);

export const rhythmLatencyMsSelector = (state: ReduxState) =>
	(instrumentSelector(state) === 'sax'
		? state.settings.saxRhythmLatencyMs
		: state.settings.rhythmLatencyMs) ?? 0;

export const currStepBeatsSelector = createSelector([sessionCardsSelector], ({ cards, index }) =>
	cards[index] ? stepBeats(cards[index]) : [],
);

export const rhythmModeSelector = createSelector(
	[deckRhythmSettingsSelector, instrumentSelector, chordInputModeSelector],
	(settings, instrument, inputMode) =>
		settings.enabled &&
		(instrument === 'sax' || (instrument === 'piano' && inputMode === 'piano')),
);

export const rhythmActiveSelector = createSelector(
	[rhythmModeSelector, currStepBeatsSelector, (s: ReduxState) => s.rhythm.grid],
	(mode, beats, grid) => mode && !!grid && hasRhythm(beats),
);

export const currBeatsPerBarSelector = createSelector(
	[sessionCardsSelector],
	({ cards, index }) => {
		const card = cards[index];
		return card?.type === CardTypeEnum.MultiSheet
			? beatsPerBarOf(card.question)
			: DEFAULT_BEATS_PER_BAR;
	},
);

export const metronomeBpmSelector = createSelector(
	[rhythmModeSelector, deckTempoSelector, bpmSelector],
	(mode, tempo, adaptive) => (mode ? tempo : adaptive.bpm),
);

export const currRhythmCardSelector = createSelector(
	[(s: ReduxState) => s.rhythm.card, (s: ReduxState) => s.scheduler.batchId],
	(card, batchId) => (card?.batchId === batchId ? card : undefined),
);

export const nextDeadlineMsSelector = createSelector(
	[
		rhythmActiveSelector,
		currRhythmCardSelector,
		currStepBeatsSelector,
		(s: ReduxState) => s.scheduler.multiPartCardIndex,
		(s: ReduxState) => s.rhythm.grid,
		deckRhythmSettingsSelector,
		rhythmLatencyMsSelector,
		instrumentSelector,
	],
	(active, card, beats, index, grid, settings, latencyMs, instrument): number | undefined => {
		const beat = beats[index];
		if (
			!active ||
			instrument === 'sax' ||
			!grid ||
			!card ||
			card.anchorMs === undefined ||
			beat == null
		)
			return;
		if (card.steps[index]) return;
		const expected = expectedMs(card.anchorMs, card.anchorBeat ?? 0, beat, grid.beatMs);
		return deadlineMs(expected, settings.strictness) + latencyMs;
	},
);

export const currTimingSelector = createSelector(
	[currRhythmCardSelector, currStepBeatsSelector, deckRhythmSettingsSelector, deckTempoSelector],
	(card, beats, { strictness }, bpm) => ({
		bpm,
		strictness,
		steps: beats.map((_, i) => card?.steps[i]),
		offsetsMs: beats.map((_, i) => card?.steps[i]?.offsetMs ?? null),
	}),
);

export const attemptTimingSelector = createSelector(
	[rhythmActiveSelector, currTimingSelector],
	(active, { bpm, strictness, offsetsMs }) =>
		active ? { bpm, strictness, offsetsMs } : undefined,
);

export const rhythmReportSelector = createSelector(
	[rhythmActiveSelector, currTimingSelector, (s: ReduxState) => s.scheduler.currCard],
	(active, { steps }, cardId) =>
		active && cardId ? { cardId, steps: steps.flatMap((s) => (s ? [s] : [])) } : undefined,
);

const tickPosition = (offsetMs: number | null, rangeMs: number) =>
	offsetMs === null ? 1 : Math.min(1, Math.max(0, 0.5 + offsetMs / (2 * rangeMs)));

const timingSummary = (steps: StepGrade[]) => {
	const offsets = steps.flatMap((s) => (s.offsetMs === null ? [] : [s.offsetMs]));
	if (offsets.length === 0) return '';
	const mean = Math.round(offsets.reduce((a, b) => a + b, 0) / offsets.length);
	const trend = mean > 10 ? 'dragging' : mean < -10 ? 'rushing' : 'steady';
	return `avg ${mean > 0 ? '+' : ''}${mean} ms · ${trend}`;
};

export const timingStripSelector = createSelector(
	[rhythmModeSelector, currTimingSelector, (s: ReduxState) => s.rhythm.lastReport],
	(mode, live, lastReport) => {
		const liveSteps = live.steps.flatMap((s) => (s ? [s] : []));
		const steps = liveSteps.length > 0 ? liveSteps : lastReport?.steps;
		if (!mode || !steps?.length) return undefined;
		const rangeMs = TIERS_MS[live.strictness].ok * 1.5;
		const ticks = steps.map((s) => ({
			tier: s.tier,
			position: tickPosition(s.offsetMs, rangeMs),
		}));
		return { ticks, summary: timingSummary(steps), rangeMs };
	},
);
