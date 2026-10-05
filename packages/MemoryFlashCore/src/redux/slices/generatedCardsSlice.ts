import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
	GeneratedChordCard,
	GeneratedSong,
	GenerationStage,
	isGeneratedCardValid,
} from '../../types/GeneratedCards';
import { invalidChordNames } from '../../lib/chordTones';

export interface Generation {
	stage: GenerationStage;
	startedAt: number;
	uploadPercent: number;
	hasImage: boolean;
}

export interface GeneratedCardsState {
	song: GeneratedSong | null;
	selected: boolean[];
	generation: Generation | null;
}

const initialState: GeneratedCardsState = { song: null, selected: [], generation: null };

const generatedCardsSlice = createSlice({
	name: 'generatedCards',
	initialState,
	reducers: {
		setSong(state, action: PayloadAction<GeneratedSong>) {
			state.song = action.payload;
			state.selected = action.payload.cards.map(isGeneratedCardValid);
		},
		startGeneration(state, action: PayloadAction<{ hasImage: boolean }>) {
			const { hasImage } = action.payload;
			state.generation = {
				stage: 'uploading',
				startedAt: Date.now(),
				uploadPercent: 0,
				hasImage,
			};
		},
		setGeneration(state, action: PayloadAction<Partial<Generation> | null>) {
			state.generation = action.payload &&
				state.generation && { ...state.generation, ...action.payload };
		},
		toggleCard(state, action: PayloadAction<number>) {
			state.selected[action.payload] = !state.selected[action.payload];
		},
		updateCard(
			state,
			action: PayloadAction<{ index: number; changes: Partial<GeneratedChordCard> }>,
		) {
			const card = state.song?.cards[action.payload.index];
			if (card?.type !== 'Chord Memory') return;
			Object.assign(card, action.payload.changes);
			card.invalidChords = invalidChordNames(card.chords);
		},
		removeCard(state, action: PayloadAction<number>) {
			state.song?.cards.splice(action.payload, 1);
			state.selected.splice(action.payload, 1);
		},
		clear() {
			return initialState;
		},
	},
});

export const generatedCardsReducer = generatedCardsSlice.reducer;
export const generatedCardsActions = generatedCardsSlice.actions;
