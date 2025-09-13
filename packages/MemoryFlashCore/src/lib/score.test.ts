import { expect } from 'chai';
import { Score } from './score';
import { StaffEnum } from '../types/Cards';
import { scoreToQuestion } from './scoreBuilder';

describe('Score', () => {
	it('creates new measure when beats overflow', () => {
		const s = new Score();
		for (let i = 0; i < 5; i++) s.addNote(StaffEnum.Treble, [{ name: 'C', octave: 4 }], 'q');
		expect(s.measures.length).to.equal(2);
	});
	it('converts to MultiSheetQuestion with rests', () => {
		const s = new Score();
		s.addNote(StaffEnum.Treble, [{ name: 'C', octave: 4 }], 'q');
		s.addRest(StaffEnum.Treble, 'q');
		const q = scoreToQuestion(s, 'C');
		expect(q.voices).to.have.length(1);
		const restFlags = q.voices[0].stack.map((n) => n.rest || false);
		expect(restFlags).to.deep.equal([false, true, true]);
	});
});
