import { expect } from 'chai';
import {
	chordNameToRomanNumeral,
	chordSymbolToChordName,
	diatonicRomanNumerals,
	displayChordSymbol,
	prettyChordSymbol,
	romanNumeralToChordName,
} from './romanNumerals';
import { AnswerType } from '../types/Cards';
import { getDefaultChordMemoryChord } from './chordTones';

describe('romanNumerals', () => {
	it('converts roman numerals to chord names in a minor key', () => {
		const numerals = ['i', 'V', 'bVII', 'IV', 'bVI', 'bIII', 'iv', 'V'];
		expect(numerals.map((n) => romanNumeralToChordName('Bm', n))).to.deep.equal([
			'Bm',
			'F#',
			'A',
			'E',
			'G',
			'D',
			'Em',
			'F#',
		]);
	});

	it('handles diminished, half diminished and sevenths', () => {
		expect(romanNumeralToChordName('C', 'vii°')).to.equal('Bdim');
		expect(romanNumeralToChordName('C', 'iiø7')).to.equal('Dm7b5');
		expect(romanNumeralToChordName('C', 'V7')).to.equal('G7');
		expect(romanNumeralToChordName('C', 'ii7')).to.equal('Dm7');
		expect(romanNumeralToChordName('C', 'IVmaj7')).to.equal('Fmaj7');
		expect(romanNumeralToChordName('C', '♭VII')).to.equal('Bb');
		expect(romanNumeralToChordName('C', 'nope')).to.equal(null);
	});

	it('converts chord names to roman numerals', () => {
		const chords = ['Bm', 'F#', 'A', 'E', 'G', 'D', 'Em', 'F#'];
		expect(chords.map((c) => chordNameToRomanNumeral('Bm', c))).to.deep.equal([
			'i',
			'V',
			'bVII',
			'IV',
			'bVI',
			'bIII',
			'iv',
			'V',
		]);
		expect(chordNameToRomanNumeral('C', 'Dm7')).to.equal('ii7');
		expect(chordNameToRomanNumeral('C', 'Bdim')).to.equal('vii°');
		expect(chordNameToRomanNumeral('C', 'Bm7b5')).to.equal('viiø7');
		expect(chordNameToRomanNumeral('C', 'Fmaj7')).to.equal('IVmaj7');
		expect(chordNameToRomanNumeral('C', 'Xyz')).to.equal(null);
	});

	it('resolves typed symbols for either notation', () => {
		expect(chordSymbolToChordName('B♭', 'chordNames')).to.equal('Bb');
		expect(chordSymbolToChordName('H', 'chordNames')).to.equal(null);
		expect(chordSymbolToChordName('♭VII', 'romanNumerals', 'Bm')).to.equal('A');
		expect(chordSymbolToChordName('V', 'romanNumerals')).to.equal(null);
	});

	it('lists diatonic numerals and pretty prints accidentals', () => {
		expect(diatonicRomanNumerals('G')[1]).to.equal('ii');
		expect(diatonicRomanNumerals('Em')[0]).to.equal('i');
		expect(prettyChordSymbol('Bbm7')).to.equal('B♭m7');
		expect(prettyChordSymbol('F#m7b5')).to.equal('F♯m7♭5');
		expect(prettyChordSymbol('bVII')).to.equal('♭VII');
	});

	it('displays a chord in the answer notation', () => {
		const chord = getDefaultChordMemoryChord('F#');
		const base = { type: AnswerType.ChordMemory as const, chords: [chord] };
		expect(displayChordSymbol(chord, base)).to.equal('F♯');
		expect(
			displayChordSymbol(chord, { ...base, key: 'Bm', notation: 'romanNumerals' }),
		).to.equal('V');
	});
});
