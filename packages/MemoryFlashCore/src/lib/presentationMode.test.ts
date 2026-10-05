import { expect } from 'chai';
import { AnswerType, Card, CardTypeEnum } from '../types/Cards';
import { MultiSheetQuestion } from '../types/MultiSheetCard';
import { PresentationMode } from '../types/PresentationMode';
import { chord, sheetQuestion, soEasyC } from './testData/soEasyToFallInLove';
import {
	activePresentationMode,
	availablePresentationModes,
	rendersAsText,
} from './presentationMode';

const card = (presentationModes: PresentationMode[], question: MultiSheetQuestion = soEasyC) =>
	({
		_id: 'c',
		deckId: 'd',
		type: CardTypeEnum.MultiSheet,
		question: { ...question, presentationModes },
		answer: { type: AnswerType.ExactMulti },
	}) as Card;

const ids = (c: Card) => availablePresentationModes(c).map((m) => m.id);
const melody = sheetQuestion([chord(['C4'], 'w')]);
const roman = { [CardTypeEnum.MultiSheet]: 'Roman Numerals' as const };

describe('availablePresentationModes', () => {
	it('offers Roman Numerals on sheet music cards that have chords', () => {
		expect(ids(card([{ id: 'Sheet Music' }]))).to.deep.equal(['Sheet Music', 'Roman Numerals']);
		expect(
			ids(card([{ id: 'Sheet Music' }, { id: 'Sheet Music w/ Chords' }, { id: 'Chords' }])),
		).to.deep.equal(['Sheet Music', 'Sheet Music w/ Chords', 'Chords', 'Roman Numerals']);
	});

	it('does not offer it without chords, on text prompts, or twice', () => {
		expect(ids(card([{ id: 'Sheet Music' }], melody))).to.deep.equal(['Sheet Music']);
		expect(ids(card([{ id: 'Text Prompt', text: 'x' }]))).to.deep.equal(['Text Prompt']);
		expect(ids(card([{ id: 'Roman Numerals' }]))).to.deep.equal(['Roman Numerals']);
	});
});

describe('activePresentationMode', () => {
	it('uses the chosen chip when the card offers it', () => {
		expect(activePresentationMode(card([{ id: 'Sheet Music' }]), roman)?.id).to.equal(
			'Roman Numerals',
		);
	});

	it('falls back to the card’s first mode', () => {
		expect(activePresentationMode(card([{ id: 'Sheet Music' }], melody), roman)?.id).to.equal(
			'Sheet Music',
		);
		expect(activePresentationMode(card([{ id: 'Sheet Music' }]), {})?.id).to.equal(
			'Sheet Music',
		);
	});
});

describe('rendersAsText', () => {
	it('is true for text prompt and roman numeral cards', () => {
		const text = card([{ id: 'Text Prompt', text: 'Torn Chorus' }]);
		expect(rendersAsText(text, {})).to.equal(true);
		expect(rendersAsText(card([{ id: 'Sheet Music' }]), roman)).to.equal(true);
	});

	it('is false for sheet music', () => {
		expect(rendersAsText(card([{ id: 'Sheet Music' }]), {})).to.equal(false);
	});
});
