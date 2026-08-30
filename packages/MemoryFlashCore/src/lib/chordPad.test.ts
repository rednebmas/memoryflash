import { expect } from 'chai';
import { CHORD_ROOTS, EMPTY_PENDING, applyPadKey, padRoots, renderPending } from './chordPad';

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

	it('builds roman numerals with case toggle and prefix accidentals', () => {
		const roots = padRoots('romanNumerals', 'Bm');
		expect(roots).to.deep.equal(['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII']);
		expect(renderPending(type(['VII', '♭'], roots), 'romanNumerals')).to.equal('bVII');
		expect(renderPending(type(['v', 'Aa'], roots), 'romanNumerals')).to.equal('V');
		expect(renderPending(type(['ii°'], roots), 'romanNumerals')).to.equal('ii°');
		expect(renderPending(type(['ii°', '7'], roots), 'romanNumerals')).to.equal('ii7');
	});
});
