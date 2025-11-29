import { expect } from 'chai';
import { ValidatorEngine } from './ValidatorEngine';
import { ScoreTimeline } from './scoreTimeline';
import { createMockDispatch } from './createMockDispatch';

const simpleTimeline: ScoreTimeline = {
	events: [{ midi: 60, voice: 0, start: 0, end: 1 }],
	beats: [0, 1],
};

describe('ValidatorEngine', () => {
	it('skips validation while waiting for notes to clear', () => {
		const engine = new ValidatorEngine(simpleTimeline);
		const { actions, dispatch } = createMockDispatch();
		engine.handle({ onNotes: [62], waiting: true, index: 0, dispatch });
		expect(actions).to.have.length(0);
	});

	it('validates once waiting clears', () => {
		const engine = new ValidatorEngine(simpleTimeline);
		const { actions, dispatch } = createMockDispatch();
		engine.handle({ onNotes: [62], waiting: false, index: 0, dispatch });
		expect(actions.length).to.be.greaterThan(0);
	});
});
