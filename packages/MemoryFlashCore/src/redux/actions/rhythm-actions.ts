import { chordOnset, expectedMs, isRollTooSlow, snapAnchor, tierFor } from '../../lib/rhythm/grade';
import { MidiNote } from '../slices/midiSlice';
import { rhythmActions } from '../slices/rhythmSlice';
import {
	currRhythmCardSelector,
	currStepBeatsSelector,
	deckRhythmSettingsSelector,
	rhythmActiveSelector,
	rhythmLatencyMsSelector,
} from '../selectors/rhythmSelectors';
import { ReduxState, SyncAppThunk } from '../store';
import { recordAttempt } from './record-attempt-action';

const gradeContext = (state: ReduxState, index: number) => {
	const grid = state.rhythm.grid;
	const beat = currStepBeatsSelector(state)[index];
	if (!rhythmActiveSelector(state) || !grid || beat == null) return;
	const card = currRhythmCardSelector(state);
	return { grid, beat, card, batchId: state.scheduler.batchId };
};

export const reportRhythmMiss = (): SyncAppThunk => (dispatch, getState) => {
	const card = currRhythmCardSelector(getState());
	if (card?.missReported) return;
	dispatch(rhythmActions.markMissReported(getState().scheduler.batchId));
	dispatch(recordAttempt(false));
};

export const reportStepOnset =
	(index: number, notes: MidiNote[]): SyncAppThunk =>
	(dispatch, getState) => {
		const ctx = gradeContext(getState(), index);
		const onset = ctx && chordOnset(notes, ctx.card?.lastEndMs ?? -Infinity);
		if (!ctx || !onset) return;
		const onsetMs = onset.onsetMs - rhythmLatencyMsSelector(getState());
		const anchorMs = ctx.card?.anchorMs ?? snapAnchor(onsetMs, ctx.grid);
		const anchorBeat = ctx.card?.anchorBeat ?? ctx.beat;
		const offsetMs = onsetMs - expectedMs(anchorMs, anchorBeat, ctx.beat, ctx.grid.beatMs);
		const { strictness } = deckRhythmSettingsSelector(getState());
		const tier = isRollTooSlow(onset.spreadMs) ? 'miss' : tierFor(offsetMs, strictness);
		const anchor =
			ctx.card?.anchorMs === undefined ? { ms: anchorMs, beat: anchorBeat } : undefined;
		const endMs = onset.onsetMs + onset.spreadMs;
		const grade = { onsetMs, offsetMs: Math.round(offsetMs), tier };
		dispatch(rhythmActions.gradeStep({ batchId: ctx.batchId, index, grade, endMs, anchor }));
		if (tier === 'miss') dispatch(reportRhythmMiss());
	};

export const markStepMissed =
	(index: number): SyncAppThunk =>
	(dispatch, getState) => {
		const ctx = gradeContext(getState(), index);
		if (!ctx || ctx.card?.steps[index]) return;
		const grade = { onsetMs: performance.now(), offsetMs: null, tier: 'miss' as const };
		dispatch(rhythmActions.gradeStep({ batchId: ctx.batchId, index, grade }));
		dispatch(reportRhythmMiss());
	};
