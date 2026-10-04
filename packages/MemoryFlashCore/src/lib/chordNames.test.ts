import { expect } from 'chai';
import {
	chordSlots,
	progressionChordNames,
	romanNumeralPrompt,
	withChordNames,
	writtenChordNames,
} from './chordNames';
import {
	chord,
	sheetQuestion as question,
	soEasyC,
	soEasyNamesC,
	soEasyNumerals,
} from './testData/soEasyToFallInLove';

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

	it('uses chord names written on the card over detection', () => {
		const q = question([chord(['E4', 'G4', 'Bb4'], 'w', { chordName: 'C7' })]);
		expect(progressionChordNames(q)).to.deep.equal(['C7']);
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

describe('chordSlots', () => {
	it('gives one slot per chord, skipping tied continuations', () => {
		const slots = chordSlots(soEasyC);
		expect(slots.map((s) => s.index)).to.deep.equal([0, 1, 2, 3, 5, 6, 7]);
		expect(slots.map((s) => s.detected)).to.deep.equal([
			'F',
			'Em',
			'Edim',
			'F',
			'FMb5',
			'Em',
			'Edim',
		]);
		expect(slots[2].notes).to.deep.equal(['E', 'G', 'Bb']);
	});

	it("misses every one of Sam's rootless chords, so typing is needed", () => {
		const detected = chordSlots(soEasyC).map((s) => s.detected);
		expect(detected.filter((d, i) => d === soEasyNamesC[i])).to.deep.equal([]);
	});

	it('ignores single melody notes', () => {
		const q = question([chord(['C4'], 'h'), chord(['D4', 'F4'], 'h')]);
		expect(chordSlots(q).map((s) => s.index)).to.deep.equal([1]);
	});
});

describe('withChordNames', () => {
	it('saves typed names on the chord entries and drops cleared ones', () => {
		const named = withChordNames(soEasyC, ['Fmaj7', ' Em7 ', 'C7']);
		expect(named.voices[0].stack.map((s) => s.chordName)).to.deep.equal([
			'Fmaj7',
			'Em7',
			'C7',
			undefined,
			undefined,
			undefined,
			undefined,
			undefined,
		]);
		expect(writtenChordNames(withChordNames(named, [undefined, '']))).to.deep.equal(
			new Array(7).fill(undefined),
		);
	});
});

describe('romanNumeralPrompt', () => {
	it('shows the key and the progression as numerals', () => {
		expect(romanNumeralPrompt(oneFourFlatSeven)).to.equal('**Key of C**\n\nI – IV – ♭VII');
	});

	it("shows Sam's real names as IV/V – Imaj7 – ♯i°7", () => {
		const named = withChordNames(soEasyC, soEasyNamesC);
		expect(romanNumeralPrompt(named)).to.equal(`**Key of C**\n\n${soEasyNumerals}`);
	});

	it('falls back to detection for chords left blank', () => {
		const named = withChordNames(soEasyC, ['F/G', 'Cmaj7']);
		expect(romanNumeralPrompt(named)).to.equal(
			'**Key of C**\n\nIV/V – Imaj7 – iii° – IV – IVM♭5 – iii – iii°',
		);
	});

	it('prettifies flat keys', () => {
		const q = question([chord(['Bb3', 'D4', 'F4'], 'w')], 'Bb');
		expect(romanNumeralPrompt(q)).to.equal('**Key of B♭**\n\nI');
	});
});
