import { expect } from 'chai';
import { AnswerType, Card, CardTypeEnum, ChordMemoryAnswer, StaffEnum } from '../types/Cards';
import { MultiSheetQuestion, StackedNotes } from '../types/MultiSheetCard';
import {
	progressionChordNames,
	romanNumeralDeckCards,
	romanNumeralSource,
} from './romanNumeralDeck';

const chord = (names: string[], duration: StackedNotes['duration'], extra = {}): StackedNotes => ({
	notes: names.map((n) => ({ name: n.slice(0, -1), octave: Number(n.slice(-1)) })),
	duration,
	...extra,
});

const question = (stack: StackedNotes[], key = 'C'): MultiSheetQuestion => ({
	key,
	voices: [{ staff: StaffEnum.Treble, stack }],
});

const oneFourFlatSeven = question([
	chord(['C4', 'E4', 'G4'], 'w'),
	chord(['C4', 'F4', 'A4'], 'h'),
	chord(['D4', 'F4', 'Bb4'], 'h'),
]);

describe('progressionChordNames', () => {
	it('names root position chords and inversions', () => {
		expect(progressionChordNames(oneFourFlatSeven)).to.deep.equal(['C', 'F', 'Bb']);
	});

	it('prefers m7 over 6 and keeps sevenths', () => {
		const q = question([
			chord(['D4', 'F4', 'A4', 'C5'], 'h'),
			chord(['G3', 'B3', 'D4', 'F4'], 'h'),
		]);
		expect(progressionChordNames(q)).to.deep.equal(['Dm7', 'G7']);
	});

	it('merges tied chords and repeated chords', () => {
		const q = question([
			chord(['C4', 'E4', 'G4'], 'h', { tie: { toNext: [0, 1, 2] } }),
			chord(['C4', 'E4', 'G4'], 'q', { tie: { fromPrevious: [0, 1, 2] } }),
			chord(['E4', 'G4', 'C5'], 'q'),
			chord(['G3', 'B3', 'D4', 'F4'], 'w'),
		]);
		expect(progressionChordNames(q)).to.deep.equal(['C', 'G7']);
	});

	it('uses chord names written on the card', () => {
		const q = question([chord(['C4', 'E4', 'G4'], 'w', { chordName: 'C6' })]);
		expect(progressionChordNames(q)).to.deep.equal(['C6']);
	});

	it('skips single notes and rests', () => {
		const q = question([
			chord(['C4'], 'q'),
			{ notes: [], duration: 'q', rest: true },
			chord(['G3', 'B3', 'D4'], 'h'),
		]);
		expect(progressionChordNames(q)).to.deep.equal(['G']);
	});
});

describe('romanNumeralDeckCards', () => {
	it('builds one roman numeral chord memory card per key', () => {
		const result = romanNumeralDeckCards(oneFourFlatSeven);
		expect(result?.questions).to.have.length(12);
		const keys = result!.answers.map((a) => a.key);
		expect(new Set(keys).size).to.equal(12);
		const d = result!.answers.findIndex((a) => a.key === 'D');
		const answer = result!.answers[d] as ChordMemoryAnswer;
		expect(answer.type).to.equal(AnswerType.ChordMemory);
		expect(answer.notation).to.equal('romanNumerals');
		expect(answer.chords.map((c) => c.chordName)).to.deep.equal(['D', 'G', 'C']);
		expect(answer.chords[0].requiredTones).to.deep.equal(['D', 'F#', 'A']);
		const prompt = result!.questions[d].presentationModes?.[0];
		expect(prompt).to.deep.equal({ id: 'Text Prompt', text: '**Key of D**\n\nI – IV – ♭VII' });
	});

	it('spells flat keys with flats', () => {
		const result = romanNumeralDeckCards(oneFourFlatSeven);
		const eb = result!.answers.find((a) => a.key === 'Eb');
		expect(eb?.chords.map((c) => c.chordName)).to.deep.equal(['Eb', 'Ab', 'Db']);
		expect(result!.questions.some((q) => q.presentationModes?.[0].id === 'Text Prompt')).to.be
			.true;
	});

	it('returns null when the card has no chords', () => {
		expect(romanNumeralDeckCards(question([chord(['C4'], 'w')]))).to.equal(null);
	});
});

describe('romanNumeralSource', () => {
	const card = (q: MultiSheetQuestion, type = AnswerType.ExactMulti) =>
		({ type: CardTypeEnum.MultiSheet, question: q, answer: { type } }) as Card;

	it('returns the question of a sheet music card with chords', () => {
		expect(romanNumeralSource(card(oneFourFlatSeven))).to.equal(oneFourFlatSeven);
	});

	it('ignores chord memory cards and cards without chords', () => {
		expect(romanNumeralSource(card(oneFourFlatSeven, AnswerType.ChordMemory))).to.equal(null);
		expect(romanNumeralSource(card(question([chord(['C4'], 'w')])))).to.equal(null);
	});
});
