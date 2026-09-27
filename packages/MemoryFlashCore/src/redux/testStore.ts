import { Action, combineReducers } from '@reduxjs/toolkit';
import { attemptsReducer } from './slices/attemptsSlice';
import { authReducer } from './slices/authSlice';
import { cardsReducer } from './slices/cardsSlice';
import { midiReducer } from './slices/midiSlice';
import { networkReducer } from './slices/networkSlice';
import { rhythmReducer } from './slices/rhythmSlice';
import { schedulerReducer } from './slices/schedulerSlice';
import { settingsReducer } from './slices/settingsSlice';
import { userDeckStatsReducer } from './slices/userDeckStatsSlice';
import { userStatsReducer } from './slices/userStatsSlice';
import { AppThunk, ReduxState, SyncAppThunk } from './store';

const reducer = combineReducers({
	attempts: attemptsReducer,
	auth: authReducer,
	cards: cardsReducer,
	midi: midiReducer,
	network: networkReducer,
	rhythm: rhythmReducer,
	scheduler: schedulerReducer,
	settings: settingsReducer,
	userDeckStats: userDeckStatsReducer,
	userStats: userStatsReducer,
});

export const makeTestStore = () => {
	const posted: object[] = [];
	const extra = { api: { post: async (_: string, body: object) => posted.push(body) } };
	let state = reducer(undefined, { type: 'init' });
	const getState = (): ReduxState => state as never;
	const dispatch = (action: Action | AppThunk | SyncAppThunk): void | Promise<void> => {
		if (typeof action === 'function')
			return action(dispatch as never, getState, extra as never);
		state = reducer(state, action);
	};
	return { dispatch, getState, posted };
};
