import { expect } from 'chai';
import { Note } from 'tonal';
import { StaffEnum } from '../types/Cards';
import { MultiSheetQuestion } from '../types/MultiSheetCard';
import { questionToTimeline, notesForSlice, computeTieSkipAdvance } from './answerTimeline';

describe('answerTimeline', () => {
	it('handles treble rest with bass note', () => {
		const q: MultiSheetQuestion = {
			key: 'C',
			voices: [
				{ staff: StaffEnum.Treble, stack: [{ notes: [], duration: 'q', rest: true }] },
				{
					staff: StaffEnum.Bass,
					stack: [{ notes: [{ name: 'C', octave: 3 }], duration: 'q' }],
				},
			],
		};
		const t = questionToTimeline(q);
		expect(t).to.have.length(1);
		expect(notesForSlice(t, 0)).to.deep.equal([Note.midi('C3')]);
	});

	it('skips sustained notes across slices', () => {
		const q: MultiSheetQuestion = {
			key: 'C',
			voices: [
				{
					staff: StaffEnum.Treble,
					stack: [{ notes: [{ name: 'C', octave: 4 }], duration: 'w' }],
				},
				{
					staff: StaffEnum.Bass,
					stack: [
						{ notes: [], duration: 'q', rest: true },
						{ notes: [], duration: 'q', rest: true },
						{ notes: [], duration: 'q', rest: true },
						{ notes: [], duration: 'q', rest: true },
					],
				},
			],
		};
		const t = questionToTimeline(q);
		expect(t).to.have.length(4);
		const { nextIndex, isCompleted } = computeTieSkipAdvance(t, 0, (idx) =>
			notesForSlice(t, idx),
		);
		expect(isCompleted).to.equal(true);
		expect(nextIndex).to.equal(3);
	});
});
