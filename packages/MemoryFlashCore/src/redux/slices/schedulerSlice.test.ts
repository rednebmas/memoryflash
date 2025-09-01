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
