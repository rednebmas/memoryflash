import { createEntityAdapter, createSlice, EntityState, PayloadAction } from '@reduxjs/toolkit';
import { StatsByCardId } from '../../types/StatsByCardType';
import { UserDeckStatsType } from '../../types/UserDeckStats';

export interface UserDeckStatsState extends EntityState<UserDeckStatsType, string> {
	numCards?: number;
	statsByCardId?: StatsByCardId;
}

export const userDeckStatsAdapter = createEntityAdapter({
	selectId: (deck: UserDeckStatsType) => deck._id as string,
});

const initialState: UserDeckStatsState = userDeckStatsAdapter.getInitialState({});

const userDeckStatsSlice = createSlice({
	name: 'userDeckStats',
	initialState,
	reducers: {
		upsert: userDeckStatsAdapter.upsertMany,
		setNumCards: (state, action: PayloadAction<number>) => {
			state.numCards = action.payload;
		},
		setStatsByCardId: (state, action: PayloadAction<StatsByCardId>) => {
			state.statsByCardId = action.payload;
		},
	},
});

export const userDeckStatsReducer = userDeckStatsSlice.reducer;
export const userDeckStatsActions = userDeckStatsSlice.actions;
