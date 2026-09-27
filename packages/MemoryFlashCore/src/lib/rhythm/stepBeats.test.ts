import { expect } from 'chai';
import { stepBeats } from './stepBeats';
import { AnswerType, Card, CardTypeEnum, StaffEnum } from '../../types/Cards';
import { StackedNotes } from '../../types/MultiSheetCard';

const note = (name: string, octave = 4) => ({ name, octave });

const makeCard = (voices: StackedNotes[][], answer: Card['answer']): Card => ({
	_id: 'c',
	deckId: 'd',
	uid: 'u',
	type: CardTypeEnum.MultiSheet,
	question: {
		key: 'C',
		voices: voices.map((stack) => ({ staff: StaffEnum.Treble, stack })),
	},
	answer,
	createdAt: new Date(),
	updatedAt: new Date(),
});

const exact = { type: AnswerType.ExactMulti };
const chordMemory = (count: number) => ({
	type: AnswerType.ChordMemory,
	chords: Array(count).fill({ chordName: 'C', requiredTones: ['C'], optionalTones: [] }),
});

describe('stepBeats', () => {
	it('returns the onset beat of each step for sheet music', () => {
		const card = makeCard(
			[
				[
					{ notes: [note('C')], duration: 'q' },
					{ notes: [], duration: 'q', rest: true },
					{ notes: [note('E')], duration: 'h' },
				],
			],
			exact,
		);
		expect(stepBeats(card)).to.deep.equal([0, 2]);
	});

	it('skips tied continuations and merges two voices', () => {
		const card = makeCard(
			[
				[
					{ notes: [note('C')], duration: 'q', tie: { toNext: [0] } },
					{ notes: [note('C')], duration: 'q', tie: { fromPrevious: [0] } },
				],
				[
					{ notes: [note('C', 3)], duration: 'q' },
					{ notes: [note('G', 3)], duration: 'q' },
				],
			],
			exact,
		);
		expect(stepBeats(card)).to.deep.equal([0, 1]);
	});

	it('returns one beat per chord for chord memory cards', () => {
		const chord = (dur: 'w' | 'h'): StackedNotes => ({
			notes: [note('C'), note('E'), note('G')],
			duration: dur,
		});
		const card = makeCard([[chord('w'), chord('h'), chord('h')]], chordMemory(3));
		expect(stepBeats(card)).to.deep.equal([0, 4, 6]);
	});

	it('disables rhythm when chord count does not match the sheet', () => {
		const card = makeCard([[{ notes: [note('C')], duration: 'w' }]], chordMemory(2));
		expect(stepBeats(card)).to.deep.equal([null, null]);
	});
});
