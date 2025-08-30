import { createEntityAdapter, createSlice, EntityState, PayloadAction } from '@reduxjs/toolkit';
import { Attempt } from '../../types/Attempt';

export const attemptsAdapter = createEntityAdapter({
	selectId: (attempt: Attempt) => attempt._id,
});

export interface AttemptsState extends EntityState<Attempt, string> {
	curr: Attempt[];
}

const initialState: AttemptsState = attemptsAdapter.getInitialState({ curr: [] });

const attemptsSlice = createSlice({
	name: 'attempts',
	initialState,
	reducers: {
		upsert: attemptsAdapter.upsertMany,
		removeMany: attemptsAdapter.removeMany,
	},
});

export const attemptsReducer = attemptsSlice.reducer;
export const attemptsActions = attemptsSlice.actions;
