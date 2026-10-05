import { expect } from 'chai';
import { generatedCardsPayloadSelector } from './generatedCardsSelector';
import { ReduxState } from '../store';
import { AnswerType, StaffEnum } from '../../types/Cards';
import { GeneratedCard } from '../../types/GeneratedCards';
import { MultiSheetQuestion } from '../../types/MultiSheetCard';

const sheet: MultiSheetQuestion = {
	key: 'F',
	voices: [
		{ staff: StaffEnum.Treble, stack: [{ notes: [{ name: 'C', octave: 5 }], duration: 'w' }] },
	],
	presentationModes: [{ id: 'Sheet Music' }],
};

const cards: GeneratedCard[] = [
	{ type: 'Sheet Music', prompt: '[Melody] Song', question: sheet, problems: [] },
	{
		type: 'Chord Memory',
		prompt: '[Verse] Song',
		chords: ['F', 'C'],
		key: 'F',
		notation: 'chordNames',
		patternId: 'A',
		invalidChords: [],
	},
	{ type: 'Text Prompt', prompt: 'skipped', question: sheet, problems: [] },
];

const state = {
	generatedCards: {
		song: { title: 'Song', artist: '', key: 'F', patterns: [], cards },
		selected: [true, true, false],
	},
} as never as ReduxState;

describe('generatedCardsPayloadSelector', () => {
	it('builds questions and answers for each selected card type', () => {
		const { questions, answers } = generatedCardsPayloadSelector(state);
		expect(questions).to.have.length(2);
		expect(questions[0]).to.equal(sheet);
		expect(questions[1].presentationModes).to.deep.equal([
			{ id: 'Text Prompt', text: '[Verse] Song' },
		]);
		expect(answers.map((a) => a.type)).to.deep.equal([
			AnswerType.ExactMulti,
			AnswerType.ChordMemory,
		]);
	});
});
