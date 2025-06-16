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

	it('fits questions into the provided range', () => {
		const lowest = 'C5';
		const highest = 'C6';
		const result = questionsForAllMajorKeys(base, lowest, highest);
		const minMidi = Note.midi(lowest)!;
		const maxMidi = Note.midi(highest)!;
		result.forEach((q) =>
			q.voices.forEach((v) =>
				v.stack.forEach((sn) =>
					sn.notes.forEach((n) => {
						const midi = Note.midi(`${n.name}${n.octave}`)!;
						expect(midi).to.be.at.least(minMidi);
						expect(midi).to.be.at.most(maxMidi);
					}),
				),
			),
		);
	});
});
