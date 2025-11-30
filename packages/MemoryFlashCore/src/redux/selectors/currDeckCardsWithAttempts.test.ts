import { expect } from 'chai';
import {
	currDeckAllWithAttemptsSelector,
	currDeckWithAttemptsSelector,
	selectHiddenCardIds,
} from './currDeckCardsWithAttempts';
import { CardTypeEnum, AnswerType, StaffEnum, Card } from '../../types/Cards';
import { ReduxState } from '../store';

const makeCard = (id: string, deckId: string): Card =>
	({
		_id: id,
		uid: 'user1',
		deckId,
		type: CardTypeEnum.BasicSheet,
		question: { staff: StaffEnum.Treble, notes: [] },
		answer: { type: AnswerType.AnyOctave, notes: [] },
		createdAt: new Date(),
		updatedAt: new Date(),
	}) as Card;

const makeUserDeckStats = (deckId: string, hiddenCardIds: string[]) => ({
	_id: 'stat1',
	deckId,
	userId: 'user1',
	hiddenCardIds,
	attempts: 0,
	medianTimeTaken: 0,
	medianHistory: [],
	createdAt: new Date(),
	updatedAt: new Date(),
});

const baseState = {
	scheduler: {
		batchId: 'b',
		currStartTime: 0,
		nextCards: [],
		answeredCards: [],
		multiPartCardIndex: 0,
		deck: 'deck1',
	},
	cards: {
		entities: {
			card1: makeCard('card1', 'deck1'),
			card2: makeCard('card2', 'deck1'),
			card3: makeCard('card3', 'deck2'),
		},
	},
	attempts: { entities: {}, curr: null, ids: [] },
	userDeckStats: { entities: {}, ids: [] },
} as unknown as ReduxState;

describe('currDeckCardsWithAttempts', () => {
	describe('currDeckAllWithAttemptsSelector', () => {
		it('includes all cards for the current deck', () => {
			const result = currDeckAllWithAttemptsSelector(baseState);
			expect(Object.keys(result)).to.have.members(['card1', 'card2']);
			expect(result.card3).to.be.undefined;
		});

		it('includes hidden cards', () => {
			const stateWithHidden = {
				...baseState,
				userDeckStats: {
					entities: { stat1: makeUserDeckStats('deck1', ['card1']) },
					ids: ['stat1'],
				},
			} as unknown as ReduxState;
			const result = currDeckAllWithAttemptsSelector(stateWithHidden);
			expect(Object.keys(result)).to.have.members(['card1', 'card2']);
		});
	});

	describe('currDeckWithAttemptsSelector', () => {
		it('excludes hidden cards', () => {
			const stateWithHidden = {
				...baseState,
				userDeckStats: {
					entities: { stat1: makeUserDeckStats('deck1', ['card1']) },
					ids: ['stat1'],
				},
			} as unknown as ReduxState;
			const result = currDeckWithAttemptsSelector(stateWithHidden);
			expect(Object.keys(result)).to.deep.equal(['card2']);
			expect(result.card1).to.be.undefined;
		});
	});

	describe('selectHiddenCardIds', () => {
		it('returns empty array when no hidden cards', () => {
			const result = selectHiddenCardIds(baseState);
			expect(result).to.deep.equal([]);
		});

		it('returns hidden card ids for the current deck', () => {
			const stateWithHidden = {
				...baseState,
				userDeckStats: {
					entities: { stat1: makeUserDeckStats('deck1', ['card1', 'card2']) },
					ids: ['stat1'],
				},
			} as unknown as ReduxState;
			const result = selectHiddenCardIds(stateWithHidden);
			expect(result).to.have.members(['card1', 'card2']);
		});
	});
});
