import { expect } from 'chai';
import { setupDeckStore } from '../testStore';
import { recordAttempt } from './record-attempt-action';
import { midiNoteOn } from './midi-note-on-action';
import { midiActions } from '../slices/midiSlice';
import {
	midiActionKeyRowsSelector,
	midiActionKeysSelector,
} from '../selectors/midiActionKeysSelector';

describe('midiNoteOn', () => {
	it('adds ordinary notes for grading', () => {
		const store = setupDeckStore();
		store.dispatch(midiNoteOn({ number: 60, time: 0 }));
		expect(store.getState().midi.notes.map((n) => n.number)).to.deep.equal([60]);
	});

	it('toggles the metronome on the default key without grading it', () => {
		const store = setupDeckStore();
		store.dispatch(midiNoteOn({ number: 25, time: 0 }));
		expect(store.getState().rhythm.metronomePlaying).to.equal(true);
		expect(store.getState().midi.notes).to.deep.equal([]);
		expect(store.getState().midi.wrongNotes).to.deep.equal([]);
		store.dispatch(midiNoteOn({ number: 25, time: 1 }));
		expect(store.getState().rhythm.metronomePlaying).to.equal(false);
	});

	it('learns a restart key that restarts the card and is never graded', async () => {
		const store = setupDeckStore({ missRepeats: 1 });
		store.dispatch(midiActions.learnActionKey('restartCard'));
		store.dispatch(midiNoteOn({ number: 21, time: 0 }));
		expect(midiActionKeysSelector(store.getState()).restartCard).to.equal(21);
		expect(store.getState().midi.notes).to.deep.equal([]);
		await store.dispatch(recordAttempt(false));
		const { batchId } = store.getState().scheduler;
		store.dispatch(midiNoteOn({ number: 21, time: 1 }));
		expect(store.getState().scheduler.batchId).to.not.equal(batchId);
		expect(store.getState().midi.notes).to.deep.equal([]);
	});

	it('moves a key to the action it was just learned for', () => {
		const store = setupDeckStore();
		store.dispatch(midiActions.learnActionKey('restartCard'));
		store.dispatch(midiNoteOn({ number: 25, time: 0 }));
		expect(midiActionKeysSelector(store.getState())).to.deep.equal({
			restartCard: 25,
			toggleMetronome: null,
		});
		expect(store.getState().rhythm.metronomePlaying).to.equal(false);
	});
});

describe('midiActionKeyRowsSelector', () => {
	it('names each mapped key and marks the one being learned', () => {
		const store = setupDeckStore();
		store.dispatch(midiActions.learnActionKey('restartCard'));
		expect(midiActionKeyRowsSelector(store.getState())).to.deep.equal([
			{ action: 'restartCard', label: 'Restart card', keyName: undefined, learning: true },
			{
				action: 'toggleMetronome',
				label: 'Start/stop metronome',
				keyName: 'C#1',
				learning: false,
			},
		]);
	});
});
