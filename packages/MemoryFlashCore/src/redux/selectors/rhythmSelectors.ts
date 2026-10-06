import { createSelector } from '@reduxjs/toolkit';
import { DEFAULT_RHYTHM, TIERS_MS } from '../../lib/rhythm/types';
import { stepVerdict, timingSummary } from '../../lib/rhythm/status';
import { deadlineMs, expectedMs } from '../../lib/rhythm/grade';
import { hasRhythm, stepBeats } from '../../lib/rhythm/stepBeats';
import {
	LADDER_CLEAN_TO_RISE,
	LADDER_MISSES_TO_DROP,
	LADDER_WINDOW,
	ladderProgress,
	resolveLadder,
} from '../../lib/rhythm/tempoLadder';
import { clickSlots, enabledClicks } from '../../lib/rhythm/metronomeClicks';
import { beatsPerBarOf, DEFAULT_BEATS_PER_BAR } from '../../lib/measure';
import { CardTypeEnum } from '../../types/Cards';
import { ReduxState } from '../store';
import { currDeckStatsSelector } from './activeSchedulerSelector';
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
	[instrumentSelector, chordInputModeSelector],
	(instrument, inputMode) =>
		instrument === 'sax' || (instrument === 'piano' && inputMode === 'piano'),
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

export const metronomeClicksSelector = createSelector(
	[deckRhythmSettingsSelector, currBeatsPerBarSelector],
	({ clicks }, beatsPerBar) => enabledClicks(clicks, beatsPerBar),
);

export const metronomeClickRowsSelector = createSelector(
	[metronomeClicksSelector, currBeatsPerBarSelector],
	(clicks, beatsPerBar) =>
		clickSlots(beatsPerBar).map((s) => ({ ...s, on: clicks.includes(s.slot) })),
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

const liveStepsSelector = createSelector([currTimingSelector], ({ steps }) =>
	steps.flatMap((s) => (s ? [s] : [])),
);

export const rhythmReportSelector = createSelector(
	[rhythmActiveSelector, liveStepsSelector, (s: ReduxState) => s.scheduler.currCard],
	(active, steps, cardId) => (active && cardId ? { cardId, steps } : undefined),
);

const tickPosition = (offsetMs: number | null, rangeMs: number) =>
	offsetMs === null ? 1 : Math.min(1, Math.max(0, 0.5 + offsetMs / (2 * rangeMs)));

const displayedStepsSelector = createSelector(
	[liveStepsSelector, (s: ReduxState) => s.rhythm.lastReport],
	(live, lastReport) => (live.length > 0 ? live : (lastReport?.steps ?? [])),
);

export const timingStripSelector = createSelector(
	[rhythmModeSelector, rhythmActiveSelector, displayedStepsSelector, deckRhythmSettingsSelector],
	(mode, active, steps, { strictness }) => {
		if (!mode || (!active && steps.length === 0)) return undefined;
		const rangeMs = TIERS_MS[strictness].ok * 1.5;
		const ticks = steps.map((s) => ({
			tier: s.tier,
			position: tickPosition(s.offsetMs, rangeMs),
		}));
		return { ticks, summary: timingSummary(steps) };
	},
);

export const rhythmStatusSelector = createSelector(
	[
		rhythmModeSelector,
		rhythmActiveSelector,
		deckTempoSelector,
		(s: ReduxState) => s.rhythm.grid,
		displayedStepsSelector,
	],
	(mode, active, bpm, grid, steps): string | undefined => {
		if (!grid) return undefined;
		if (!mode) return `Metronome only · ${bpm} bpm · timing is graded with piano or sax input`;
		const prefix = `Rhythm mode · ${bpm} bpm`;
		if (!active) return `${prefix} · this card has no rhythm to grade`;
		const last = steps[steps.length - 1];
		return `${prefix} · ${last ? stepVerdict(last) : 'your first chord sets beat one'}`;
	},
);

export const tempoProgressSelector = createSelector(
	[rhythmModeSelector, (s: ReduxState) => s.rhythm.grid, deckLadderSelector],
	(mode, grid, ladder) => {
		const progress = mode && grid ? ladderProgress(ladder) : undefined;
		if (!progress) return undefined;
		const { nextBpm, clean, misses, canDrop } = progress;
		const drop =
			canDrop && misses > 0
				? ` · ${misses} of ${LADDER_MISSES_TO_DROP} misses before slowing down`
				: '';
		return {
			label: `${ladder.bpm} → ${nextBpm} bpm · ${clean} of ${LADDER_CLEAN_TO_RISE} cards in time (last ${LADDER_WINDOW})${drop}`,
			fraction: clean / LADDER_CLEAN_TO_RISE,
		};
	},
);
