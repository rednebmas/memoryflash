import { expect } from 'chai';
import { StepTimeController } from './stepTimeController';
import { StaffEnum } from '../types/Cards';

describe('StepTimeController', () => {
	it('adds notes and advances beat', () => {
		const c = new StepTimeController();
		c.input([{ name: 'C', octave: 4 }]);
		c.input([{ name: 'D', octave: 4 }]);
		const v = c.score.measures[0][StaffEnum.Treble].voices[0];
		expect(v.events).to.have.length(2);
		expect(v.beat).to.equal(2);
	});
	it('inserts rest when rest mode enabled', () => {
		const c = new StepTimeController();
		c.setRestMode(true);
		c.input([]);
		const e = c.score.measures[0][StaffEnum.Treble].voices[0].events[0];
		expect(e.type).to.equal('rest');
	});
	it('targets selected staff', () => {
		const c = new StepTimeController();
		c.setStaff(StaffEnum.Bass);
		c.input([{ name: 'C', octave: 3 }]);
		const treble = c.score.measures[0][StaffEnum.Treble].voices[0].events;
		const bass = c.score.measures[0][StaffEnum.Bass].voices[0].events;
		expect(treble).to.have.length(0);
		expect(bass).to.have.length(1);
	});
});
