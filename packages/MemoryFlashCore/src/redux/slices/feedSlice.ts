import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FeedEntry } from '../../types/Feed';

export type FeedState = {
	entries: FeedEntry[];
};

const initialState: FeedState = {
	entries: [],
};

const feedSlice = createSlice({
	name: 'feed',
	initialState,
	reducers: {
		setFeed(state, action: PayloadAction<FeedEntry[]>) {
			state.entries = action.payload;
		},
	},
});

export const feedReducer = feedSlice.reducer;
export const feedActions = feedSlice.actions;
