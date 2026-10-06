import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Grid, StepGrade } from '../../lib/rhythm/types';
import { TempoLadder } from '../../lib/rhythm/tempoLadder';

export type RhythmCardState = {
	batchId: string;
	anchorMs?: number;
	anchorBeat?: number;
	lastEndMs: number;
	steps: { [index: number]: StepGrade };
	missReported: boolean;
};

export type RhythmReport = { cardId: string; steps: StepGrade[] };

export interface RhythmState {
	grid?: Grid;
	card?: RhythmCardState;
	lastReport?: RhythmReport;
	sessionLadder?: { deckId: string; ladder: TempoLadder };
	metronomePlaying: boolean;
}

type GradePayload = {
	batchId: string;
	index: number;
	grade: StepGrade;
	endMs?: number;
	anchor?: { ms: number; beat: number };
};

const initialState: RhythmState = { metronomePlaying: false };

const cardFor = (state: RhythmState, batchId: string): RhythmCardState => {
	if (state.card?.batchId !== batchId) {
		state.card = { batchId, lastEndMs: -Infinity, steps: {}, missReported: false };
	}
	return state.card;
};

const rhythmSlice = createSlice({
	name: 'rhythm',
	initialState,
	reducers: {
		setGrid(state, action: PayloadAction<Grid | undefined>) {
			state.grid = action.payload;
		},
		gradeStep(state, { payload }: PayloadAction<GradePayload>) {
			const card = cardFor(state, payload.batchId);
			card.steps[payload.index] = payload.grade;
			if (payload.endMs !== undefined) card.lastEndMs = payload.endMs;
			if (payload.anchor) {
				card.anchorMs = payload.anchor.ms;
				card.anchorBeat = payload.anchor.beat;
			}
		},
		setAnchor(
			state,
			{ payload }: PayloadAction<{ batchId: string; ms: number; beat: number }>,
		) {
			const card = cardFor(state, payload.batchId);
			card.anchorMs = payload.ms;
			card.anchorBeat = payload.beat;
		},
		markMissReported(state, action: PayloadAction<string>) {
			cardFor(state, action.payload).missReported = true;
		},
		setSessionLadder(state, action: PayloadAction<RhythmState['sessionLadder']>) {
			state.sessionLadder = action.payload;
		},
		toggleMetronome(state) {
			state.metronomePlaying = !state.metronomePlaying;
		},
		stopMetronome(state) {
			state.metronomePlaying = false;
		},
		setLastReport(state, action: PayloadAction<RhythmReport | undefined>) {
			state.lastReport = action.payload;
		},
	},
});

export const rhythmReducer = rhythmSlice.reducer;
export const rhythmActions = rhythmSlice.actions;
