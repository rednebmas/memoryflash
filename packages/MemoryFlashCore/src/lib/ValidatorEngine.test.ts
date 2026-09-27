import { expect } from 'chai';
import { ValidatorEngine } from './ValidatorEngine';
import { buildScoreTimeline, ScoreTimeline } from './scoreTimeline';
import { StaffEnum } from '../types/Cards';
import { createMockDispatch } from './createMockDispatch';
import { toMidiNotes } from './addedNotes';

const simpleTimeline: ScoreTimeline = {
	events: [{ midi: 60, voice: 0, start: 0, end: 1 }],
	beats: [0, 1],
};

describe('ValidatorEngine', () => {
	it('skips validation while waiting for notes to clear', () => {
		const engine = new ValidatorEngine(simpleTimeline);
		const { actions, dispatch } = createMockDispatch();
		engine.handle({
			notes: toMidiNotes([62]),
			waitingNotes: [],
			waiting: true,
			index: 0,
			dispatch,
		});
		expect(actions).to.have.length(0);
	});

	it('validates once waiting clears', () => {
		const engine = new ValidatorEngine(simpleTimeline);
		const { actions, dispatch } = createMockDispatch();
		engine.handle({
			notes: toMidiNotes([62]),
			waitingNotes: [],
			waiting: false,
			index: 0,
			dispatch,
		});
		expect(actions.length).to.be.greaterThan(0);
	});
});

describe('ValidatorEngine legato', () => {
	const twoChords: ScoreTimeline = {
		events: [
			{ midi: 60, voice: 0, start: 0, end: 1 },
			{ midi: 62, voice: 0, start: 1, end: 2 },
		],
		beats: [0, 1, 2],
	};

	it('accepts the next note pressed before the previous one is released', () => {
		const engine = new ValidatorEngine(twoChords);
		const first = createMockDispatch();
		engine.handle({
			notes: toMidiNotes([60]),
			waitingNotes: [],
			waiting: false,
			index: 0,
			dispatch: first.dispatch,
		});
		const held = toMidiNotes([60]);
		const noop = createMockDispatch();
		engine.handle({
			notes: toMidiNotes([60, 62]),
			waitingNotes: held,
			waiting: true,
			index: 1,
			dispatch: noop.dispatch,
		});
		expect(noop.actions).to.have.length(0);
		const second = createMockDispatch();
		engine.handle({
			notes: toMidiNotes([62]),
			waitingNotes: [],
			waiting: false,
			index: 1,
			dispatch: second.dispatch,
		});
		expect(second.actions.map((a) => a.type)).to.include('midi/waitUntilEmpty');
		expect(second.actions.map((a) => a.type)).to.not.include('midi/addWrongNote');
	});
});

describe('ValidatorEngine rests', () => {
	it('accepts the note after a rest', () => {
		const timeline = buildScoreTimeline({
			key: 'C',
			voices: [
				{
					staff: StaffEnum.Treble,
					stack: [
						{ notes: [{ name: 'C', octave: 4 }], duration: 'q' },
						{ notes: [], duration: 'q', rest: true },
						{ notes: [{ name: 'E', octave: 4 }], duration: 'h' },
					],
				},
			],
		});
		expect(timeline.beats).to.deep.equal([0, 2, 4]);
		const engine = new ValidatorEngine(timeline);
		const { actions, dispatch } = createMockDispatch();
		const args = { waitingNotes: [], waiting: false, index: 1, dispatch };
		engine.handle({ ...args, notes: toMidiNotes([64]) });
		expect(actions.map((a) => a.type)).to.not.include('midi/addWrongNote');
		expect(actions.map((a) => a.type)).to.include('midi/waitUntilEmpty');
	});
});
