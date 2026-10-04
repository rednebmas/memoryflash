import { expect } from 'chai';
import { makeCard } from '../../lib/schedulers/testHelpers';
import { AnswerType } from '../../types/Cards';
import { cardsActions } from '../slices/cardsSlice';
import { schedulerActions } from '../slices/schedulerSlice';
import { settingsActions } from '../slices/settingsSlice';
import { authActions } from '../slices/authSlice';
import { recordAttempt } from './record-attempt-action';
import { schedule } from './schedule-cards-action';
import { makeTestStore } from '../testStore';
import { userDeckStatsActions } from '../slices/userDeckStatsSlice';
import { UserDeckStatsType } from '../../types/UserDeckStats';

describe('recordAttempt with the recall scheduler', () => {
	it('re-asks a known card after 2, then 5+, then as many other cards as an 8 card deck allows', async () => {
		const store = makeTestStore();
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

describe('recordAttempt with the speed scheduler', () => {
	const missThenAnswer = async (missRepeats?: number) => {
		const store = makeTestStore();
		store.dispatch(authActions.setUser({ _id: 'u' } as never));
		store.dispatch(
			cardsActions.upsert(['a', 'b', 'c', 'd', 'e', 'f'].map((id) => makeCard(id)) as never),
		);
		const stats = { _id: 's', deckId: 'd1', missRepeats } as UserDeckStatsType;
		store.dispatch(userDeckStatsActions.upsert([stats]));
		store.dispatch(schedulerActions.setParsingDeck('d1'));
		store.dispatch(schedule('d1'));
		const missed = store.getState().scheduler.currCard!;
		await store.dispatch(recordAttempt(false));
		await store.dispatch(recordAttempt(true));
		return store.getState().scheduler.nextCards.filter((id) => id === missed).length;
	};

	it('brings a missed card back once by default', async () => {
		expect(await missThenAnswer()).to.equal(1);
	});

	it('brings a missed card back as often as the deck setting asks', async () => {
		expect(await missThenAnswer(0)).to.equal(0);
		expect(await missThenAnswer(2)).to.equal(2);
	});
});
