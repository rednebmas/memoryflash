import { expect } from 'chai';
import {
	CHORD_ROOTS,
	EMPTY_PENDING,
	applyPadKey,
	padRoots,
	renderPending,
	startsNewChord,
} from './chordPad';

const type = (keys: string[], roots = CHORD_ROOTS) =>
	keys.reduce((pending, key) => applyPadKey(pending, key, roots), EMPTY_PENDING);

describe('chordPad', () => {
	it('builds chord names from taps', () => {
		expect(renderPending(type(['A', 'm']), 'chordNames')).to.equal('Am');
		expect(renderPending(type(['B', '♭', 'maj7']), 'chordNames')).to.equal('Bbmaj7');
		expect(renderPending(type(['F', '♯', 'm', 'm7']), 'chordNames')).to.equal('F#m7');
	});

	it('toggles modifiers and supports backspace', () => {
		expect(renderPending(type(['C', '♭', '♭']), 'chordNames')).to.equal('C');
		expect(renderPending(type(['C', '7', '7']), 'chordNames')).to.equal('C');
		expect(renderPending(type(['C', '♯', '7', '⌫']), 'chordNames')).to.equal('C#');
		expect(renderPending(type(['C', '⌫', '⌫']), 'chordNames')).to.equal('');
		expect(type(['m'])).to.deep.equal(EMPTY_PENDING);
	});

	it('starts a new chord when a root is tapped', () => {
		expect(renderPending(type(['A', 'm', 'D']), 'chordNames')).to.equal('D');
	});

	it('builds slash chords', () => {
		expect(renderPending(type(['D', '/']), 'chordNames')).to.equal('D/');
		expect(renderPending(type(['D', '/', 'F', '♯']), 'chordNames')).to.equal('D/F#');
		expect(renderPending(type(['A', 'm7', '/', 'G']), 'chordNames')).to.equal('Am7/G');
		expect(renderPending(type(['B', '♭', '/', 'D']), 'chordNames')).to.equal('Bb/D');
		expect(renderPending(type(['D', '/', 'F', '♯', '⌫']), 'chordNames')).to.equal('D/');
		expect(renderPending(type(['D', '/', '⌫']), 'chordNames')).to.equal('D');
		expect(renderPending(type(['D', '/', '/']), 'chordNames')).to.equal('D');
		expect(type(['/'])).to.deep.equal(EMPTY_PENDING);
	});

	it('starts a new chord only once the bass is chosen', () => {
		expect(startsNewChord(type(['D']), 'F', CHORD_ROOTS)).to.equal(true);
		expect(startsNewChord(type(['D', '/']), 'F', CHORD_ROOTS)).to.equal(false);
		expect(startsNewChord(type(['D', '/', 'F']), 'G', CHORD_ROOTS)).to.equal(true);
		expect(startsNewChord(EMPTY_PENDING, 'F', CHORD_ROOTS)).to.equal(false);
	});

	it('builds roman numerals with case toggle and prefix accidentals', () => {
		const roots = padRoots('romanNumerals', 'Bm');
		expect(roots).to.deep.equal(['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII']);
		expect(renderPending(type(['VII', '♭'], roots), 'romanNumerals')).to.equal('bVII');
		expect(renderPending(type(['v', 'Aa'], roots), 'romanNumerals')).to.equal('V');
		expect(renderPending(type(['ii°'], roots), 'romanNumerals')).to.equal('ii°');
		expect(renderPending(type(['ii°', '7'], roots), 'romanNumerals')).to.equal('ii7');
		expect(renderPending(type(['VI', '/', 'III'], roots), 'romanNumerals')).to.equal('VI/III');
	});
});
