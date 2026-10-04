import { expect } from 'chai';
import { makeTestStore } from '../testStore';
import { cardsActions } from '../slices/cardsSlice';
import { AnswerType, Card, CardTypeEnum } from '../../types/Cards';
import { MultiSheetQuestion } from '../../types/MultiSheetCard';
import { withChordNames, writtenChordNames } from '../../lib/chordNames';
import { soEasyBb, soEasyC } from '../../lib/testData/soEasyToFallInLove';
import { syncTransposedCopies } from './sync-transposed-copies-action';

const card = (id: string, question: MultiSheetQuestion) =>
	({
		_id: id,
		deckId: 'd1',
		type: CardTypeEnum.MultiSheet,
		question,
		answer: { type: AnswerType.ExactMulti },
	}) as Card;

describe('syncTransposedCopies', () => {
	it('patches transposed copies with transposed names and the display mode', async () => {
		const store = makeTestStore();
		store.dispatch(cardsActions.upsert([card('c', soEasyC), card('bb', soEasyBb)]));
		const patched: string[] = [];
		const patch = async (url: string, body: { question: MultiSheetQuestion }) => {
			patched.push(url);
			return { data: { card: card('bb', body.question) } };
		};
		const roman: MultiSheetQuestion = {
			...withChordNames(soEasyC, ['Fmaj7']),
			presentationModes: [{ id: 'Roman Numerals' }],
		};
		const thunk = syncTransposedCopies('c', roman);
		await thunk(store.dispatch as never, store.getState, { api: { patch } } as never);
		expect(patched).to.deep.equal(['/cards/bb']);
		const bb = store.getState().cards.entities['bb'].question as MultiSheetQuestion;
		expect(writtenChordNames(bb)[0]).to.equal('Ebmaj7');
		expect(bb.presentationModes).to.deep.equal([{ id: 'Roman Numerals' }]);
	});
});
