import { expect } from 'chai';
import { questionsForAllMajorKeys } from './multiKeyTransposer';
import { majorKeys } from './notes';
import { MultiSheetQuestion } from '../types/MultiSheetCard';
import { StaffEnum } from '../types/Cards';
import { Note } from 'tonal';

describe('questionsForAllMajorKeys', () => {
	const base: MultiSheetQuestion = {
		key: 'C',
		voices: [
			{
				staff: StaffEnum.Treble,
				stack: [{ notes: [{ name: 'C', octave: 4 }], duration: 'q' }],
			},
		],
	};

	it('generates a question for each major key', () => {
		const result = questionsForAllMajorKeys(base, 'C3', 'C5');
		expect(result.length).to.equal(majorKeys.length);
		expect(result.map((q) => q.key)).to.deep.equal(majorKeys);
	});

	it('does not shift the base key even if notes are outside the range', () => {
		const lowBase: MultiSheetQuestion = {
			key: 'C',
			voices: [
				{
					staff: StaffEnum.Bass,
					stack: [{ notes: [{ name: 'B', octave: 2 }], duration: 'q' }],
				},
			],
		};
		const result = questionsForAllMajorKeys(lowBase, 'C3', 'C5');
		const baseQ = result[0];
		expect(baseQ.key).to.equal('C');
		expect(baseQ.voices[0].stack[0].notes[0].name).to.equal('B');
		expect(baseQ.voices[0].stack[0].notes[0].octave).to.equal(2); // Unshifted, even though MIDI 47 < 48 (C3)
	});

	it('chooses the best octave shift for a transposed key to center the average MIDI', () => {
		const lowBase: MultiSheetQuestion = {
			key: 'C',
			voices: [
				{
					staff: StaffEnum.Bass,
					stack: [{ notes: [{ name: 'A', octave: 2 }], duration: 'q' }],
				},
			],
		};
		const result = questionsForAllMajorKeys(lowBase, 'C3', 'C5');
		const gQ = result[1]; // 'G' key
		expect(gQ.key).to.equal('G');
		expect(gQ.voices[0].stack[0].notes[0].name).to.equal('E');
		expect(gQ.voices[0].stack[0].notes[0].octave).to.equal(4); // Shifted +1 from E3 to E4 for better centering
	});
});
