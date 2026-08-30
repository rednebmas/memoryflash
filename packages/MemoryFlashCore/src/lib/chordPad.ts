import { ChordNotation } from '../types/Cards';
import { diatonicRomanNumerals } from './romanNumerals';

export type PendingChord = {
	root: string;
	accidental: '' | 'b' | '#';
	quality: string;
	bass: string;
};

export const EMPTY_PENDING: PendingChord = { root: '', accidental: '', quality: '', bass: '' };

export const CHORD_ROOTS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
export const BACKSPACE = '⌫';
export const ENTER = '✓';
const CHORD_MODIFIERS = ['♭', '♯', 'm', '7', 'maj7', 'm7', 'dim'];
const ROMAN_MODIFIERS = ['♭', '♯', 'Aa', '7', 'maj7', '°', 'ø7'];
const EXTRAS = ['sus4', 'sus2', 'add9', '6', BACKSPACE, ENTER];

export const padRoots = (notation: ChordNotation, key?: string): string[] =>
	notation === 'romanNumerals' && key ? diatonicRomanNumerals(key) : CHORD_ROOTS;

export const padRows = (notation: ChordNotation, key?: string): string[][] => [
	padRoots(notation, key),
	notation === 'romanNumerals' ? ROMAN_MODIFIERS : CHORD_MODIFIERS,
	EXTRAS,
];

const splitNumeral = (numeral: string): { root: string; quality: string } => {
	const match = numeral.match(/^([IVXivx]+)(.*)$/);
	return match ? { root: match[1], quality: match[2] } : { root: numeral, quality: '' };
};

const toggleCase = (root: string): string =>
	root === root.toUpperCase() ? root.toLowerCase() : root.toUpperCase();

export function renderPending(pending: PendingChord, notation: ChordNotation): string {
	if (!pending.root) return '';
	const bass = pending.bass ? `/${pending.bass}` : '';
	if (notation === 'romanNumerals') {
		return `${pending.accidental}${pending.root}${pending.quality}${bass}`;
	}
	return `${pending.root}${pending.accidental}${pending.quality}${bass}`;
}

export function applyPadKey(pending: PendingChord, key: string, roots: string[]): PendingChord {
	if (roots.includes(key)) return { ...EMPTY_PENDING, ...splitNumeral(key) };
	if (!pending.root) return pending;
	if (key === '♭' || key === 'b')
		return { ...pending, accidental: pending.accidental === 'b' ? '' : 'b' };
	if (key === '♯' || key === '#')
		return { ...pending, accidental: pending.accidental === '#' ? '' : '#' };
	if (key === 'Aa') return { ...pending, root: toggleCase(pending.root) };
	if (key === BACKSPACE) return backspace(pending);
	if (key === 'dim' || key === '°') return { ...pending, quality: key === '°' ? '°' : 'dim' };
	return { ...pending, quality: pending.quality === key ? '' : key };
}

function backspace(pending: PendingChord): PendingChord {
	if (pending.bass) return { ...pending, bass: '' };
	if (pending.quality) return { ...pending, quality: '' };
	if (pending.accidental) return { ...pending, accidental: '' };
	return EMPTY_PENDING;
}
