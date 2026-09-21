import { expect } from 'chai';
import { schedulerReducer, schedulerActions, SchedulerState } from './schedulerSlice';
import { scheduledCardsSelector } from '../selectors/scheduledCardsSelector';
import { CardWithAttempts } from '../selectors/currDeckCardsWithAttempts';
import { CardTypeEnum, AnswerType, StaffEnum } from '../../types/Cards';

const baseState: SchedulerState = {
	batchId: 'b',
	currStartTime: 0,
	nextCards: [],
	answeredCards: [],
	multiPartCardIndex: 0,
	sessionReviews: {},
	sessionTicks: 0,
};

describe('schedulerSlice', () => {
	it('removes card from queues and advances current card', () => {
		const state: SchedulerState = {
			...baseState,
			currCard: 'a',
			nextCards: ['a', 'b'],
			answeredCards: ['c'],
		};
		const next = schedulerReducer(state, schedulerActions.removeCard('a'));
		expect(next.currCard).to.equal('b');
		expect(next.nextCards).to.deep.equal(['b']);
		expect(next.answeredCards).to.deep.equal(['c']);
	});

	it('inserts a card at its gap, clamped to the queue length', () => {
		const state: SchedulerState = { ...baseState, currCard: 'a', nextCards: ['a', 'b', 'c'] };
		const near = schedulerReducer(state, schedulerActions.insertCard({ cardId: 'x', gap: 2 }));
		const far = schedulerReducer(state, schedulerActions.insertCard({ cardId: 'x', gap: 10 }));
		expect(near.nextCards).to.deep.equal(['a', 'b', 'x', 'c']);
		expect(far.nextCards).to.deep.equal(['a', 'b', 'c', 'x']);
	});

	it('only requeues a missed card when the scheduler asks for it', () => {
		const state: SchedulerState = { ...baseState, currCard: 'a', nextCards: ['a', 'b'] };
		const miss = (requeue: boolean) =>
			schedulerReducer(state, schedulerActions.markCurrIncorrect({ cardId: 'a', requeue }));
		expect(miss(true).nextCards).to.deep.equal(['a', 'a', 'a', 'b']);
		expect(miss(false).nextCards).to.deep.equal(['a', 'b']);
		expect(miss(false).incorrect).to.equal(true);
	});

	it('scheduledCardsSelector ignores missing ids', () => {
		const deck: { [key: string]: CardWithAttempts } = {
			b: {
				_id: 'b',
				uid: 'u',
				deckId: 'd1',
				type: CardTypeEnum.BasicSheet,
				question: { staff: StaffEnum.Treble, notes: [] },
				answer: { type: AnswerType.AnyOctave, notes: [] },
				createdAt: new Date(),
				updatedAt: new Date(),
				attempts: [],
			},
		};
		const scheduler: SchedulerState = {
			...baseState,
			nextCards: ['a', 'b'],
		};
		const result = scheduledCardsSelector.resultFunc(deck, scheduler);
		expect(result.map((c) => c._id)).to.deep.equal(['b']);
	});
});
