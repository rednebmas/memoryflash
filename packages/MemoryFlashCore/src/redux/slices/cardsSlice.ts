import { createEntityAdapter, createSlice, EntityState } from '@reduxjs/toolkit';
import { Card } from '../../types/Cards';

export const cardAdapter = createEntityAdapter({
	selectId: (card: Card) => card._id,
});

export interface CardsState extends EntityState<Card, string> {}

const initialState: CardsState = cardAdapter.getInitialState({ currStartTime: 0 });

const cardsSlice = createSlice({
	name: 'cards',
	initialState,
	reducers: {
		upsert: cardAdapter.upsertMany,
	},
});

export const cardsReducer = cardsSlice.reducer;
export const cardsActions = cardsSlice.actions;
