import { expect } from 'chai';
import { AddedNotesTracker, toMidiNotes } from './addedNotes';

describe('AddedNotesTracker', () => {
	it('reports only newly pressed notes', () => {
		const tracker = new AddedNotesTracker();
		const none = { waitingNotes: [], waiting: false };
		expect(tracker.next({ notes: toMidiNotes([60]), ...none })).to.deep.equal([60]);
		expect(tracker.next({ notes: toMidiNotes([60, 64]), ...none })).to.deep.equal([64]);
	});

	it('counts notes pressed while waiting once waiting clears', () => {
		const tracker = new AddedNotesTracker();
		const held = toMidiNotes([60, 64]);
		tracker.next({ notes: held, waitingNotes: [], waiting: false });
		tracker.next({ notes: toMidiNotes([60, 64, 65]), waitingNotes: held, waiting: true });
		tracker.next({ notes: toMidiNotes([60, 65, 69]), waitingNotes: held, waiting: true });
		const added = tracker.next({
			notes: toMidiNotes([65, 69]),
			waitingNotes: [],
			waiting: false,
		});
		expect(added).to.deep.equal([65, 69]);
	});
});
