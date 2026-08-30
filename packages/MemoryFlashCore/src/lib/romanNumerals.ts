import { Chord, Note, Progression, RomanNumeral } from 'tonal';
import { ChordMemoryAnswer, ChordMemoryChord, ChordNotation } from '../types/Cards';

export const MAJOR_NUMERALS = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
export const MINOR_NUMERALS = ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'];

export function parseKey(key: string): { tonic: string; minor: boolean } {
	const minor = key.endsWith('m');
	return { tonic: minor ? key.slice(0, -1) : key, minor };
}

export function diatonicRomanNumerals(key: string): string[] {
	return parseKey(key).minor ? MINOR_NUMERALS : MAJOR_NUMERALS;
}

export function toAsciiAccidentals(symbol: string): string {
	return symbol.replace(/♭/g, 'b').replace(/♯/g, '#');
}

export function prettyChordSymbol(symbol: string): string {
	return symbol
		.replace(/^([A-G])b/, '$1♭')
		.replace(/^b/, '♭')
		.replace(/b(?=\d)/g, '♭')
		.replace(/#/g, '♯');
}

const QUALITY_BY_SUFFIX: Record<string, string> = { '°': 'dim', o: 'dim', ø: 'm7b5' };

function chordTypeFromNumeral(major: boolean, chordType: string): string {
	const mapped = QUALITY_BY_SUFFIX[chordType.charAt(0)];
	if (mapped) return mapped + chordType.slice(1).replace(/^7/, '');
	return `${major ? '' : 'm'}${chordType}`;
}

export function romanNumeralToChordName(key: string, numeral: string): string | null {
	const rn = RomanNumeral.get(toAsciiAccidentals(numeral));
	if (rn.empty) return null;
	const root = Note.transpose(parseKey(key).tonic, rn.interval);
	if (!root) return null;
	return root + chordTypeFromNumeral(rn.major, rn.chordType);
}

export function chordNameToRomanNumeral(key: string, chordName: string): string | null {
	if (Chord.get(chordName).empty) return null;
	const [raw] = Progression.toRomanNumerals(parseKey(key).tonic, [chordName]);
	const match = raw?.match(/^([b#]*)([IV]+)(.*)$/);
	if (!match) return null;
	const [, acc, degree, rest] = match;
	if (rest.startsWith('m7b5')) return `${acc}${degree.toLowerCase()}ø7${rest.slice(4)}`;
	if (rest.startsWith('dim')) return `${acc}${degree.toLowerCase()}°${rest.slice(3)}`;
	if (rest.startsWith('m') && !rest.startsWith('maj')) {
		return `${acc}${degree.toLowerCase()}${rest.slice(1)}`;
	}
	return `${acc}${degree}${rest}`;
}

export function chordSymbolToChordName(
	symbol: string,
	notation: ChordNotation,
	key?: string,
): string | null {
	const ascii = toAsciiAccidentals(symbol);
	if (notation === 'romanNumerals') return key ? romanNumeralToChordName(key, ascii) : null;
	return Chord.get(ascii).empty ? null : ascii;
}

export function displayChordSymbol(chord: ChordMemoryChord, answer: ChordMemoryAnswer): string {
	if (answer.notation === 'romanNumerals' && answer.key) {
		return prettyChordSymbol(
			chordNameToRomanNumeral(answer.key, chord.chordName) ?? chord.chordName,
		);
	}
	return prettyChordSymbol(chord.chordName);
}
