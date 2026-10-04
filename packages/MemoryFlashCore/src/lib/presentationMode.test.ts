import { expect } from 'chai';
import { AnswerType, Card, CardTypeEnum } from '../types/Cards';
import { PresentationMode } from '../types/PresentationMode';
import { soEasyC } from './testData/soEasyToFallInLove';
import { activePresentationMode, displayModesOf, presentationModesFor } from './presentationMode';

const both: PresentationMode[] = [{ id: 'Sheet Music' }, { id: 'Roman Numerals' }];

const card = (presentationModes: PresentationMode[]) =>
	({
		_id: 'c',
		deckId: 'd',
		type: CardTypeEnum.MultiSheet,
		question: { ...soEasyC, presentationModes },
		answer: { type: AnswerType.ExactMulti },
	}) as Card;

describe('presentationModesFor', () => {
	it('gives sheet music cards every ticked display mode', () => {
		expect(
			presentationModesFor('Sheet Music', '', ['Sheet Music', 'Roman Numerals']),
		).to.deep.equal(both);
		expect(presentationModesFor('Sheet Music', '', ['Roman Numerals'])).to.deep.equal([
			{ id: 'Roman Numerals' },
		]);
	});

	it('gives text and chord memory cards only their text prompt', () => {
		const text = [{ id: 'Text Prompt', text: 'Play it' }];
		expect(presentationModesFor('Text Prompt', 'Play it', ['Sheet Music'])).to.deep.equal(text);
		expect(presentationModesFor('Chord Memory', 'Play it', ['Sheet Music'])).to.deep.equal(
			text,
		);
	});
});

describe('displayModesOf', () => {
	it('reads the display modes back in a fixed order', () => {
		expect(displayModesOf([...both].reverse())).to.deep.equal([
			'Sheet Music',
			'Roman Numerals',
		]);
		expect(displayModesOf([{ id: 'Roman Numerals' }])).to.deep.equal(['Roman Numerals']);
	});

	it('falls back to Sheet Music', () => {
		expect(displayModesOf(undefined)).to.deep.equal(['Sheet Music']);
		expect(displayModesOf([{ id: 'Text Prompt', text: 'x' }])).to.deep.equal(['Sheet Music']);
	});
});

describe('activePresentationMode', () => {
	it('uses the preferred mode when the card has it', () => {
		const pref = { [CardTypeEnum.MultiSheet]: 'Roman Numerals' as const };
		expect(activePresentationMode(card(both), pref)?.id).to.equal('Roman Numerals');
	});

	it('falls back to the card’s first mode', () => {
		const pref = { [CardTypeEnum.MultiSheet]: 'Roman Numerals' as const };
		expect(activePresentationMode(card([{ id: 'Sheet Music' }]), pref)?.id).to.equal(
			'Sheet Music',
		);
		expect(activePresentationMode(card(both), {})?.id).to.equal('Sheet Music');
	});
});
