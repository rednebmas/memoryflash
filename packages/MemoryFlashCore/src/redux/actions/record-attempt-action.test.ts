import { expect } from 'chai';
import { makeCard } from '../../lib/schedulers/testHelpers';
import { AnswerType } from '../../types/Cards';
import { cardsActions } from '../slices/cardsSlice';
import { schedulerActions } from '../slices/schedulerSlice';
import { settingsActions } from '../slices/settingsSlice';
import { authActions } from '../slices/authSlice';
import { Action, combineReducers } from '@reduxjs/toolkit';
import { attemptsReducer } from '../slices/attemptsSlice';
import { authReducer } from '../slices/authSlice';
import { cardsReducer } from '../slices/cardsSlice';
import { midiReducer } from '../slices/midiSlice';
import { networkReducer } from '../slices/networkSlice';
import { schedulerReducer } from '../slices/schedulerSlice';
import { settingsReducer } from '../slices/settingsSlice';
import { userDeckStatsReducer } from '../slices/userDeckStatsSlice';
import { userStatsReducer } from '../slices/userStatsSlice';
import { AppThunk, ReduxState, SyncAppThunk } from '../store';
import { recordAttempt } from './record-attempt-action';
import { schedule } from './schedule-cards-action';

const reducer = combineReducers({
	attempts: attemptsReducer,
	auth: authReducer,
	cards: cardsReducer,
	midi: midiReducer,
	network: networkReducer,
	scheduler: schedulerReducer,
	settings: settingsReducer,
	userDeckStats: userDeckStatsReducer,
	userStats: userStatsReducer,
});

const extra = { api: { post: async () => ({ data: {} }) } };

const makeStore = () => {
	let state = reducer(undefined, { type: 'init' });
	const getState = (): ReduxState => state as never;
	const dispatch = (action: Action | AppThunk | SyncAppThunk): void | Promise<void> => {
		if (typeof action === 'function')
			return action(dispatch as never, getState, extra as never);
		state = reducer(state, action);
	};
	return { dispatch, getState };
};

describe('recordAttempt with the recall scheduler', () => {
	it('re-asks a known card after 2, then 5+, then as many other cards as an 8 card deck allows', async () => {
		const store = makeStore();
		const cards = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((id) => ({
			...makeCard(id),
			answer: { type: AnswerType.ChordMemory, chords: [] },
		}));
		store.dispatch(authActions.setUser({ _id: 'u' } as never));
		store.dispatch(cardsActions.upsert(cards as never));
		store.dispatch(settingsActions.setChordInputMode('names'));
		store.dispatch(schedulerActions.setParsingDeck('d1'));
		store.dispatch(schedule('d1'));

		const asked: string[] = [];
		for (let i = 0; i < 30; i++) {
			asked.push(store.getState().scheduler.currCard!);
			await store.dispatch(recordAttempt(true));
		}
		const positions = asked.flatMap((id, i) => (id === 'a' ? [i] : []));
		const cardsBetween = positions.slice(1).map((pos, i) => pos - positions[i] - 1);
		expect(cardsBetween[0]).to.equal(2);
		expect(cardsBetween[1]).to.be.at.least(5);
		expect(cardsBetween[2]).to.equal(7);
	});
});
