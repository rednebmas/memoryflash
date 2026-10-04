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

const setup = (stats: Partial<UserDeckStatsType> = {}) => {
	const store = makeTestStore();
	store.dispatch(authActions.setUser({ _id: 'u' } as never));
	store.dispatch(
		cardsActions.upsert(['a', 'b', 'c', 'd', 'e', 'f'].map((id) => makeCard(id)) as never),
	);
	store.dispatch(userDeckStatsActions.upsert([{ _id: 's', deckId: 'd1', ...stats } as never]));
	store.dispatch(schedulerActions.setParsingDeck('d1'));
	store.dispatch(schedule('d1'));
	return store;
};

type Store = ReturnType<typeof setup>;

const playCard = async (store: Store, misses = 0) => {
	for (let i = 0; i < misses; i++) await store.dispatch(recordAttempt(false));
	await store.dispatch(recordAttempt(true));
	return store.getState().scheduler.currCard;
};

const postedCorrect = (store: Store) =>
	store.posted.map((attempt) => (attempt as { correct: boolean }).correct);

describe('recordAttempt after a miss', () => {
	it('moves on right away from a card played right the first time', async () => {
		const store = setup();
		const card = store.getState().scheduler.currCard;
		expect(await playCard(store)).to.not.equal(card);
		expect(postedCorrect(store)).to.deep.equal([true]);
	});

	it('retries a wrong chord in place instead of restarting the card', async () => {
		const store = setup();
		const { currCard, batchId } = store.getState().scheduler;
		store.dispatch(schedulerActions.incrementMultiPartCardIndex());
		await store.dispatch(recordAttempt(false));
		expect(store.getState().scheduler.currCard).to.equal(currCard);
		expect(store.getState().scheduler.multiPartCardIndex).to.equal(1);
		expect(store.getState().scheduler.batchId).to.equal(batchId);
		expect(store.getState().scheduler.incorrect).to.equal(true);
	});

	it('keeps a missed card up until it is played right once, then never brings it back', async () => {
		const store = setup();
		const missed = store.getState().scheduler.currCard;
		expect(await playCard(store, 1)).to.equal(missed);
		expect(store.getState().scheduler.multiPartCardIndex).to.equal(0);
		expect(store.getState().scheduler.incorrect).to.not.equal(true);
		expect(await playCard(store)).to.not.equal(missed);
		expect(store.getState().scheduler.nextCards).to.not.include(missed);
		expect(postedCorrect(store)).to.deep.equal([false, true]);
	});

	it('needs the deck setting count of right plays in a row, and a miss resets the streak', async () => {
		const store = setup({ missRepeats: 2 });
		const missed = store.getState().scheduler.currCard;
		expect(await playCard(store, 1)).to.equal(missed);
		expect(await playCard(store)).to.equal(missed);
		expect(await playCard(store, 1)).to.equal(missed);
		expect(await playCard(store)).to.equal(missed);
		expect(await playCard(store)).to.not.equal(missed);
		expect(store.getState().scheduler.nextCards).to.not.include(missed);
		expect(postedCorrect(store)).to.deep.equal([false, true, false, true, true]);
	});

	it('does not re-queue a missed card with the recall scheduler', async () => {
		const store = setup({ scheduler: 'recall' });
		const missed = store.getState().scheduler.currCard;
		await playCard(store, 1);
		expect(await playCard(store)).to.not.equal(missed);
		expect(store.getState().scheduler.nextCards).to.not.include(missed);
	});
});
