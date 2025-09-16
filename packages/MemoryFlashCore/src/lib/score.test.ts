import { expect } from 'chai';
import { Score } from './score';
import { StaffEnum } from '../types/Cards';
import { scoreToQuestion, questionToScore } from './scoreBuilder';
import { MultiSheetQuestion } from '../types/MultiSheetCard';

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
	it('preserves tie data through conversion', () => {
		const s = new Score();
		s.addNote(StaffEnum.Treble, [{ name: 'C', octave: 4 }], 'h', 0, { toNext: [0] });
		s.addNote(StaffEnum.Treble, [{ name: 'C', octave: 4 }], '16', 0, { fromPrevious: [0] });
		const trebleEvents = s.measures[0][StaffEnum.Treble].voices[0].events;
		expect(trebleEvents[0].type).to.equal('note');
		expect(trebleEvents[1].type).to.equal('note');
		if (trebleEvents[0].type === 'note') expect(trebleEvents[0].tie?.toNext).to.deep.equal([0]);
		if (trebleEvents[1].type === 'note') expect(trebleEvents[1].tie?.fromPrevious).to.deep.equal([0]);
		const question = scoreToQuestion(s, 'C');
		const stack = question.voices[0].stack;
		expect(stack[0].tie?.toNext).to.deep.equal([0]);
		expect(stack[1].tie?.fromPrevious).to.deep.equal([0]);
		const rebuilt = questionToScore(question);
		const events = rebuilt.measures[0][StaffEnum.Treble].voices[0].events;
		expect(events[0].type).to.equal('note');
		expect(events[1].type).to.equal('note');
		if (events[0].type === 'note') expect(events[0].tie?.toNext).to.deep.equal([0]);
		if (events[1].type === 'note') expect(events[1].tie?.fromPrevious).to.deep.equal([0]);
	});
	it('reconstructs score from MultiSheetQuestion', () => {
		const q: MultiSheetQuestion = {
			key: 'C',
			voices: [
				{
					staff: StaffEnum.Treble,
					stack: [
						{
							notes: [{ name: 'C', octave: 4 }],
							duration: 'q',
						},
						{ notes: [], duration: 'q', rest: true },
					],
				},
			],
		};
		const s = questionToScore(q, 4);
		const events = s.measures[0][StaffEnum.Treble].voices[0].events;
		expect(events.map((e) => e.type)).to.deep.equal(['note', 'rest']);
		expect(events.map((e) => e.duration)).to.deep.equal(['q', 'q']);
	});
});
