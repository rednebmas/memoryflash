import { expect } from 'chai';
import { getChordTones, getDefaultChordMemoryChord } from './chordTones';

describe('chordTones', () => {
	describe('getChordTones', () => {
		it('returns chord tones for Cmaj7', () => {
			expect(getChordTones('Cmaj7')).to.deep.equal(['C', 'E', 'G', 'B']);
		});

		it('returns chord tones for Dm7', () => {
			expect(getChordTones('Dm7')).to.deep.equal(['D', 'F', 'A', 'C']);
		});

		it('returns chord tones for G7', () => {
			expect(getChordTones('G7')).to.deep.equal(['G', 'B', 'D', 'F']);
		});
	});

	describe('getDefaultChordMemoryChord', () => {
		it('returns all tones as required and none optional', () => {
			const result = getDefaultChordMemoryChord('Cmaj7');
			expect(result).to.deep.equal({
				chordName: 'Cmaj7',
				requiredTones: ['C', 'E', 'G', 'B'],
				optionalTones: [],
			});
		});
	});
});
