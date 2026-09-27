import { expect } from 'chai';
import { StaffEnum } from '../types/Cards';
import { saxFingering, saxFingeringsForQuestion } from './saxFingerings';

describe('saxFingering', () => {
	it('uses all six fingers for low D', () => {
		expect(saxFingering('D4')).to.deep.equal(['L1', 'L2', 'L3', 'R1', 'R2', 'R3']);
	});

	it('handles the low end pinky keys', () => {
		expect(saxFingering('Bb3')).to.include('lowBb');
		expect(saxFingering('A#3')).to.include('lowBb');
		expect(saxFingering('C#4')).to.include.members(['lowCSharp', 'lowC']);
	});

	it('plays middle C with the left middle finger and C# open', () => {
		expect(saxFingering('C5')).to.deep.equal(['L2']);
		expect(saxFingering('C#5')).to.deep.equal([]);
	});

	it('adds the octave key from D5 to C#6', () => {
		expect(saxFingering('G5')).to.deep.equal(['octave', 'L1', 'L2', 'L3']);
		expect(saxFingering('C#6')).to.deep.equal(['octave']);
	});

	it('uses palm keys up top', () => {
		expect(saxFingering('D6')).to.deep.equal(['octave', 'palmD']);
		expect(saxFingering('F6')).to.include.members(['palmF', 'sideE']);
	});

	it('returns undefined outside the standard range', () => {
		expect(saxFingering('A3')).to.equal(undefined);
		expect(saxFingering('F#6')).to.equal(undefined);
	});
});

describe('saxFingeringsForQuestion', () => {
	it('lists unique treble notes with fingerings', () => {
		const result = saxFingeringsForQuestion({
			key: 'C',
			voices: [
				{
					staff: StaffEnum.Treble,
					stack: [
						{ notes: [{ name: 'A', octave: 4 }], duration: 'q' },
						{ notes: [{ name: 'A', octave: 4 }], duration: 'q' },
						{ notes: [{ name: 'F', octave: 3 }], duration: 'h' },
					],
				},
				{
					staff: StaffEnum.Bass,
					stack: [{ notes: [{ name: 'C', octave: 3 }], duration: 'w' }],
				},
			],
		});
		expect(result).to.deep.equal([
			{ note: 'A4', keys: ['L1', 'L2'] },
			{ note: 'F3', keys: undefined },
		]);
	});
});
