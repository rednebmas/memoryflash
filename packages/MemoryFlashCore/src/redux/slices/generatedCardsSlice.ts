import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GeneratedCard, GeneratedSong } from '../../types/GeneratedCards';

export interface GeneratedCardsState {
	song: GeneratedSong | null;
	selected: boolean[];
}

const initialState: GeneratedCardsState = { song: null, selected: [] };

const generatedCardsSlice = createSlice({
	name: 'generatedCards',
	initialState,
	reducers: {
		setSong(state, action: PayloadAction<GeneratedSong>) {
			state.song = action.payload;
			state.selected = action.payload.cards.map((c) => c.invalidChords.length === 0);
		},
		toggleCard(state, action: PayloadAction<number>) {
			state.selected[action.payload] = !state.selected[action.payload];
		},
		updateCard(
			state,
			action: PayloadAction<{ index: number; changes: Partial<GeneratedCard> }>,
		) {
			const card = state.song?.cards[action.payload.index];
			if (card) Object.assign(card, action.payload.changes);
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
