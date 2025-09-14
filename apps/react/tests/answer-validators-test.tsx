import React from 'react';
import '../src/index.css';
import { ExactMultiAnswerValidator } from '../src/components/answer-validators/ExactMultiAnswerValidator';
import { UnExactMultiAnswerValidator } from '../src/components/answer-validators/UnExactMultiAnswerValidator';
import { renderApp } from './renderApp';
import { MultiSheetCard } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { CardTypeEnum, StaffEnum } from 'MemoryFlashCore/src/types/Cards';

const params = new URLSearchParams(location.search);
const variant = params.get('variant') ?? 'start-rest';
const validator = params.get('validator') ?? 'exact';

const cards: Record<string, MultiSheetCard> = {
	'start-rest': {
		_id: '1',
		uid: '1',
		deckId: 'd',
		type: CardTypeEnum.MultiSheet,
		question: {
			key: 'C',
			voices: [
				{
					staff: StaffEnum.Treble,
					stack: [
						{ notes: [], duration: 'q', rest: true },
						{ notes: [{ name: 'C', octave: 4 }], duration: 'q' },
					],
				},
				{
					staff: StaffEnum.Bass,
					stack: [
						{
							notes: [{ name: 'C', octave: 3 }],
							duration: 'h',
						},
					],
				},
			],
		},
		answer: { type: 'ExactMulti' },
	} as MultiSheetCard,
	sustain: {
		_id: '2',
		uid: '2',
		deckId: 'd',
		type: CardTypeEnum.MultiSheet,
		question: {
			key: 'C',
			voices: [
				{
					staff: StaffEnum.Treble,
					stack: [{ notes: [{ name: 'C', octave: 4 }], duration: 'w' }],
				},
				{
					staff: StaffEnum.Bass,
					stack: [
						{ notes: [], duration: 'q', rest: true },
						{ notes: [], duration: 'q', rest: true },
						{ notes: [], duration: 'q', rest: true },
						{ notes: [], duration: 'q', rest: true },
					],
				},
			],
		},
		answer: { type: 'ExactMulti' },
	} as MultiSheetCard,
};

const card = cards[variant];
const Validator = validator === 'unexact' ? UnExactMultiAnswerValidator : ExactMultiAnswerValidator;

const App: React.FC = () => <Validator card={card} />;

renderApp(<App />, 'root', {
	cards: { [card._id]: card },
	scheduler: { currCard: card._id, deckId: card.deckId, currStartTime: Date.now() },
	attempts: { attempts: [] },
});
