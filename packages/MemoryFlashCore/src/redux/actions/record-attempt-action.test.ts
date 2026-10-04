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
	const setup = () => {
		const store = makeTestStore();
		store.dispatch(authActions.setUser({ _id: 'u' } as never));
		store.dispatch(
			cardsActions.upsert(['a', 'b', 'c', 'd', 'e', 'f'].map((id) => makeCard(id)) as never),
		);
		store.dispatch(schedulerActions.setParsingDeck('d1'));
		store.dispatch(schedule('d1'));
		return store;
	};

	it('stays on a missed card until it is answered, then moves on without bringing it back', async () => {
		const store = setup();
		const missed = store.getState().scheduler.currCard!;
		await store.dispatch(recordAttempt(false));
		expect(store.getState().scheduler.currCard).to.equal(missed);
		await store.dispatch(recordAttempt(true));
		expect(store.getState().scheduler.currCard).to.not.equal(missed);
		expect(store.getState().scheduler.nextCards).to.not.include(missed);
		expect(store.posted).to.have.length(1);
		expect((store.posted[0] as { correct: boolean }).correct).to.equal(false);
	});

	it('restarts a multi-chord card from its first chord after a wrong note', async () => {
		const store = setup();
		const { currCard, batchId } = store.getState().scheduler;
		store.dispatch(schedulerActions.incrementMultiPartCardIndex());
		await store.dispatch(recordAttempt(false));
		expect(store.getState().scheduler.currCard).to.equal(currCard);
		expect(store.getState().scheduler.multiPartCardIndex).to.equal(0);
		expect(store.getState().scheduler.batchId).to.not.equal(batchId);
	});
});
