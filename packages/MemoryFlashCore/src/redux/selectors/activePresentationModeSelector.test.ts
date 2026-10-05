import { expect } from 'chai';
import { makeTestStore } from '../testStore';
import { cardsActions } from '../slices/cardsSlice';
import { schedulerActions } from '../slices/schedulerSlice';
import { settingsActions } from '../slices/settingsSlice';
import { AnswerType, Card, CardTypeEnum } from '../../types/Cards';
import { MultiSheetQuestion } from '../../types/MultiSheetCard';
import { PresentationMode } from '../../types/PresentationMode';
import { chord, sheetQuestion, soEasyC } from '../../lib/testData/soEasyToFallInLove';
import { selectDeckPresentationModePills } from './activePresentationModeSelector';

const card = (
	_id: string,
	presentationModes: PresentationMode[],
	question: MultiSheetQuestion = soEasyC,
	deckId = 'd1',
) =>
	({
		_id,
		deckId,
		type: CardTypeEnum.MultiSheet,
		question: { ...question, presentationModes },
		answer: { type: AnswerType.ExactMulti },
	}) as Card;

const deckStore = (cards: Card[]) => {
	const store = makeTestStore();
	store.dispatch(cardsActions.upsert(cards));
	store.dispatch(schedulerActions.setParsingDeck('d1'));
	return store;
};

const sheet: PresentationMode[] = [{ id: 'Sheet Music' }];
const melody = sheetQuestion([chord(['C4'], 'w')]);

describe('selectDeckPresentationModePills', () => {
	it('offers every mode any card in the deck offers, once', () => {
		const store = deckStore([
			card('a', sheet, melody),
			card('b', sheet),
			card('c', [{ id: 'Sheet Music' }, { id: 'Chords' }]),
			card('x', [{ id: 'Text Prompt', text: 'x' }], soEasyC, 'other'),
		]);
		expect(selectDeckPresentationModePills(store.getState())).to.deep.equal([
			{
				cardType: CardTypeEnum.MultiSheet,
				modes: ['Sheet Music', 'Roman Numerals', 'Chords'],
				active: 'Sheet Music',
			},
		]);
	});

	it('marks the saved mode for the card type as active', () => {
		const store = deckStore([card('b', sheet)]);
		store.dispatch(
			settingsActions.setPresentationMode({
				cardType: CardTypeEnum.MultiSheet,
				mode: 'Roman Numerals',
			}),
		);
		expect(selectDeckPresentationModePills(store.getState())[0].active).to.equal(
			'Roman Numerals',
		);
	});

	it('offers nothing for an empty deck or when there is only one mode to pick', () => {
		expect(selectDeckPresentationModePills(deckStore([]).getState())).to.deep.equal([]);
		const single = deckStore([card('a', sheet, melody)]).getState();
		expect(selectDeckPresentationModePills(single)).to.deep.equal([]);
	});
});
