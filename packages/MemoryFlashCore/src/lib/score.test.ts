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
	it('handles dotted durations without ties', () => {
		const s = new Score();
		s.addNote(StaffEnum.Bass, [{ name: 'G', octave: 3 }], 'hd');
		s.addNote(StaffEnum.Bass, [{ name: 'G', octave: 3 }], 'q');
		const v = s.measures[0][StaffEnum.Bass].voices[0];
		expect(v.events.map((e) => e.duration)).to.deep.equal(['hd', 'q']);
		const stack = scoreToQuestion(s, 'C').voices.find((v) => v.staff === StaffEnum.Bass)!.stack;
		expect(stack.map((n) => n.duration)).to.deep.equal(['hd', 'q']);
	});
});
