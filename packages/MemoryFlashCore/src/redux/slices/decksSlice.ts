import { createEntityAdapter, createSlice, EntityState, PayloadAction } from '@reduxjs/toolkit';
import { Deck } from '../../types/Deck';

export const deckAdapter = createEntityAdapter({
	selectId: (deck: Deck) => deck._id,
});

export interface DecksState extends EntityState<Deck, string> {}

const initialState: DecksState = deckAdapter.getInitialState({
	parsingCourse: undefined,
});

const decksSlice = createSlice({
	name: 'decks',
	initialState,
	reducers: {
		upsert: deckAdapter.upsertMany,
	},
});

export const decksReducer = decksSlice.reducer;
export const decksActions = decksSlice.actions;
