import { expect } from 'chai';
import { StaffEnum } from '../types/Cards';
import { isSameNoteName, singleNoteName } from './noteNames';

const question = (names: string[]) => ({
	key: 'C',
	voices: [
		{
			staff: StaffEnum.Treble,
			stack: names.map((name) => ({ notes: [{ name, octave: 4 }], duration: 'q' as const })),
		},
	],
});

describe('noteNames', () => {
	it('names a single-note card', () => {
		expect(singleNoteName(question(['F#']))).to.equal('F#');
	});

	it('has no single name for multi-note cards', () => {
		expect(singleNoteName(question(['C', 'E']))).to.equal(undefined);
	});

	it('requires the written accidental', () => {
		expect(isSameNoteName('F', 'F')).to.equal(true);
		expect(isSameNoteName('F#', 'F#')).to.equal(true);
		expect(isSameNoteName('Gb', 'F#')).to.equal(false);
		expect(isSameNoteName('F', 'F#')).to.equal(false);
	});
});
