import { ChordNotation } from '../types/Cards';
import { diatonicRomanNumerals } from './romanNumerals';

type Accidental = '' | 'b' | '#';
type PendingNote = { root: string; accidental: Accidental };
export type PendingChord = PendingNote & { quality: string; bass: PendingNote | null };

const EMPTY_NOTE: PendingNote = { root: '', accidental: '' };
export const EMPTY_PENDING: PendingChord = { ...EMPTY_NOTE, quality: '', bass: null };

export const CHORD_ROOTS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
export const BACKSPACE = '⌫';
export const ENTER = '✓';
export const SLASH = '/';
const CHORD_MODIFIERS = ['♭', '♯', 'm', '7', 'maj7', 'm7', 'dim'];
const ROMAN_MODIFIERS = ['♭', '♯', 'Aa', '7', 'maj7', '°', 'ø7'];
const EXTRAS = ['sus4', 'sus2', 'add9', '6', SLASH, BACKSPACE, ENTER];

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

const spell = (note: PendingNote, notation: ChordNotation): string =>
	notation === 'romanNumerals'
		? `${note.accidental}${note.root}`
		: `${note.root}${note.accidental}`;

export function renderPending(pending: PendingChord, notation: ChordNotation): string {
	if (!pending.root) return '';
	const bass = pending.bass ? `/${spell(pending.bass, notation)}` : '';
	return `${spell(pending, notation)}${pending.quality}${bass}`;
}

const awaitingBass = (pending: PendingChord): boolean => !!pending.bass && !pending.bass.root;

export const startsNewChord = (pending: PendingChord, key: string, roots: string[]): boolean =>
	roots.includes(key) && !!pending.root && !awaitingBass(pending);

const toggleAccidental = (note: PendingNote, accidental: Accidental): PendingNote => ({
	...note,
	accidental: note.accidental === accidental ? '' : accidental,
});

function applyAccidental(pending: PendingChord, accidental: Accidental): PendingChord {
	if (pending.bass) return { ...pending, bass: toggleAccidental(pending.bass, accidental) };
	return { ...pending, ...toggleAccidental(pending, accidental) };
}

export function applyPadKey(pending: PendingChord, key: string, roots: string[]): PendingChord {
	if (roots.includes(key) && awaitingBass(pending))
		return { ...pending, bass: { ...EMPTY_NOTE, root: splitNumeral(key).root } };
	if (roots.includes(key)) return { ...EMPTY_PENDING, ...splitNumeral(key) };
	if (!pending.root) return pending;
	if (key === '♭' || key === 'b') return applyAccidental(pending, 'b');
	if (key === '♯' || key === '#') return applyAccidental(pending, '#');
	if (key === SLASH) return { ...pending, bass: pending.bass ? null : EMPTY_NOTE };
	if (key === 'Aa') return { ...pending, root: toggleCase(pending.root) };
	if (key === BACKSPACE) return backspace(pending);
	if (key === 'dim' || key === '°') return { ...pending, quality: key === '°' ? '°' : 'dim' };
	return { ...pending, quality: pending.quality === key ? '' : key };
}

function backspace(pending: PendingChord): PendingChord {
	if (pending.bass) return { ...pending, bass: pending.bass.root ? EMPTY_NOTE : null };
	if (pending.quality) return { ...pending, quality: '' };
	if (pending.accidental) return { ...pending, accidental: '' };
	return EMPTY_PENDING;
}
