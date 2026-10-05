import { expect } from 'chai';
import { generatedCardsActions, generatedCardsReducer } from './generatedCardsSlice';
import { GENERATED_CARD_TYPES, GeneratedSong } from '../../types/GeneratedCards';
import { toggleInOrder } from '../../lib/toggleInOrder';
import { StaffEnum } from '../../types/Cards';

const song: GeneratedSong = {
	title: 'Song',
	artist: '',
	key: 'C',
	patterns: [],
	cards: [
		{
			type: 'Sheet Music',
			prompt: '[Melody] Song',
			question: { key: 'C', voices: [{ staff: StaffEnum.Treble, stack: [] }] },
			problems: ['Treble bar 1 has 3 beats, expected 4'],
		},
		{
			type: 'Chord Memory',
			prompt: '[Verse] Song',
			chords: ['C', 'Xyz'],
			key: 'C',
			notation: 'chordNames',
			patternId: 'A',
			invalidChords: ['Xyz'],
		},
	],
};

describe('generatedCardsSlice', () => {
	it('preselects only cards without problems and rechecks edited chords', () => {
		let state = generatedCardsReducer(undefined, generatedCardsActions.setSong(song));
		expect(state.selected).to.deep.equal([false, false]);
		state = generatedCardsReducer(
			state,
			generatedCardsActions.updateCard({ index: 1, changes: { chords: ['C', 'G'] } }),
		);
		expect(state.song?.cards[1]).to.include({ prompt: '[Verse] Song' });
		expect(state.song?.cards[1]).to.have.deep.property('invalidChords', []);
	});

	it('toggles card types in a stable order', () => {
		const toggle = (
			types: (typeof GENERATED_CARD_TYPES)[number][],
			type: (typeof types)[number],
		) => toggleInOrder(GENERATED_CARD_TYPES, types, type);
		expect(toggle(['Chord Memory'], 'Sheet Music')).to.deep.equal([
			'Sheet Music',
			'Chord Memory',
		]);
		expect(toggle(['Sheet Music', 'Chord Memory'], 'Sheet Music')).to.deep.equal([
			'Chord Memory',
		]);
	});
});
