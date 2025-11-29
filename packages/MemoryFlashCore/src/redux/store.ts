import { Action, Reducer, ThunkAction, combineReducers, configureStore } from '@reduxjs/toolkit';
import { AxiosInstance } from 'axios';
// import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { nullableGet } from '../lib/keypaths';
import { logout } from './actions/logout-action';
import api from './api';
import { IS_PRODUCTION } from './env';
import { attemptsReducer } from './slices/attemptsSlice';
import { authActions, authReducer } from './slices/authSlice';
import { cardsReducer } from './slices/cardsSlice';
import { communityReducer } from './slices/communitySlice';
import { coursesReducer } from './slices/coursesSlice';
import { decksReducer } from './slices/decksSlice';
import { feedReducer } from './slices/feedSlice';
import { midiReducer } from './slices/midiSlice';
import { networkReducer } from './slices/networkSlice';
import { schedulerReducer } from './slices/schedulerSlice';
import { settingsReducer } from './slices/settingsSlice';
import { userDeckStatsReducer } from './slices/userDeckStatsSlice';

const appReducer = combineReducers({
	attempts: attemptsReducer,
	auth: authReducer,
	cards: cardsReducer,
	community: communityReducer,
	courses: coursesReducer,
	decks: decksReducer,
	feed: feedReducer,
	midi: midiReducer,
	network: networkReducer,
	scheduler: schedulerReducer,
	settings: settingsReducer,
	userDeckStats: userDeckStatsReducer,
});

type ExtraThunkArgs = {
	api: AxiosInstance;
	persistStore: (state: ReduxState) => void;
};

export type ReduxState = ReturnType<typeof appReducer>;
export type AppDispatch = ReturnType<typeof createStore>['dispatch'];

export type AppThunk = ThunkAction<Promise<void>, ReduxState, ExtraThunkArgs, Action<string>>;

export type SyncAppThunk = ThunkAction<void, ReduxState, ExtraThunkArgs, Action<string>>;

const rootReducer: Reducer<ReduxState, Action, {}> = (
	state: ReduxState | {} | undefined,
	action: Action,
) => {
	if (action.type === authActions.completelyResetReduxState.type) {
		console.log('♻️ Resetting redux state from root reducer');
		state = undefined;
	}

	return appReducer(state, action);
};

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<ReduxState> = useSelector;

export const createStore = (
	preloadedState: Partial<ReduxState> = {},
	persistStore: (state: ReduxState) => void,
) => {
	const store = configureStore({
		reducer: rootReducer,
		preloadedState: preloadedState,
		middleware: (gm) =>
			gm({
				serializableCheck: !IS_PRODUCTION,
				thunk: { extraArgument: { api, persistStore } },
			}),
		devTools: !IS_PRODUCTION,
	});

	api.interceptors.response.use(
		(res) => res,
		async (err: unknown) => {
			const msg = nullableGet(err, 'response.data.msg');
			if (msg === 'session expired') {
				console.log('🔑 Session expired, deauthenticating');
				store.dispatch(authActions.setIsAuthenticated(false));
			}
			if (nullableGet(err, 'response.data.logout')) {
				console.log('Logged out by backend');
				store.dispatch(logout());
			}
			return Promise.reject(err);
		},
	);

	return store;
};

export type Store = ReturnType<typeof createStore>;
