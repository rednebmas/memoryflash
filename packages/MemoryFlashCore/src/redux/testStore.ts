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
import { schedule } from './actions/schedule-cards-action';
import { authActions as auth } from './slices/authSlice';
import { cardsActions } from './slices/cardsSlice';
import { rhythmActions } from './slices/rhythmSlice';
import { schedulerActions } from './slices/schedulerSlice';
import { Instrument, settingsActions } from './slices/settingsSlice';
import { userDeckStatsActions } from './slices/userDeckStatsSlice';
import { UserDeckStatsType } from '../types/UserDeckStats';
import { RhythmSettings } from '../lib/rhythm/types';
import { makeCard } from '../lib/schedulers/testHelpers';
import { AnswerType, CardTypeEnum, StaffEnum } from '../types/Cards';

export const C_MAJOR = { chordName: 'C', requiredTones: ['C', 'E', 'G'], optionalTones: [] };
const chordStack = { notes: ['C', 'E', 'G'].map((name) => ({ name, octave: 4 })), duration: 'q' };

export const rhythmCard = (id: string) => ({
	...makeCard(id),
	type: CardTypeEnum.MultiSheet,
	question: { key: 'C', voices: [{ staff: StaffEnum.Treble, stack: Array(3).fill(chordStack) }] },
	answer: { type: AnswerType.ChordMemory, chords: [C_MAJOR, C_MAJOR, C_MAJOR] },
});

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

export const setupRhythmStore = (
	cards: object[],
	instrument: Instrument = 'piano',
	overrides: Partial<RhythmSettings> = {},
) => {
	const store = makeTestStore();
	store.dispatch(auth.setUser({ _id: 'u' } as never));
	store.dispatch(cardsActions.upsert(cards as never));
	const rhythm = { enabled: true, bpm: 120, strictness: 'normal' as const, ...overrides };
	const stats = { _id: 's', deckId: 'd1', rhythm } as UserDeckStatsType;
	store.dispatch(userDeckStatsActions.upsert([stats]));
	store.dispatch(settingsActions.setChordInputMode('piano'));
	store.dispatch(settingsActions.setInstrument(instrument));
	store.dispatch(schedulerActions.setParsingDeck('d1'));
	store.dispatch(schedule('d1'));
	store.dispatch(rhythmActions.setGrid({ originMs: 0, beatMs: 500 }));
	return store;
};
