import { describe, it } from 'mocha';
import { expect } from 'chai';
import { midiReducer, midiActions, MidiReduxState } from './midiSlice';

const initialState: MidiReduxState = {
	notes: [],
	wrongNotes: [],
	waitingUntilEmpty: false,
	waitingUntilEmptyNotes: [],
	availableMidiDevices: [],
	pendingClearClickedNotes: false,
};

describe('midiSlice', () => {
	describe('on-screen keyboard clicking behavior', () => {
		it('defers clearing clicked notes until mouse up via requestClearClickedNotes', () => {
			// Simulate: user clicks notes to complete a chord
			let state = midiReducer(
				initialState,
				midiActions.addNote({ number: 60, clicked: true }),
			);
			state = midiReducer(state, midiActions.addNote({ number: 64, clicked: true }));
			expect(state.notes.length).to.equal(2);

			// Validator detects correct chord and requests clear (not immediate clear)
			state = midiReducer(state, midiActions.requestClearClickedNotes());

			// Notes should still be there (user hasn't released mouse yet)
			expect(state.notes.length).to.equal(2);
			expect(state.pendingClearClickedNotes).to.be.true;

			// User releases mouse (removes one clicked note)
			state = midiReducer(state, midiActions.removeNote(64));

			// Now all clicked notes should be cleared
			expect(state.notes.length).to.equal(0);
			expect(state.pendingClearClickedNotes).to.be.false;
		});
	});
});
