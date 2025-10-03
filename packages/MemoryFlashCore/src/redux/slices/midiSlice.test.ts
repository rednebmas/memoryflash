import { expect } from 'chai';
import { midiReducer, midiActions, MidiReduxState } from './midiSlice';

const baseState: MidiReduxState = {
	notes: [],
	wrongNotes: [],
	waitingUntilEmpty: false,
	waitingUntilEmptyNotes: [],
	availableMidiDevices: [],
	pianoSamplesEnabled: false,
};

describe('midiSlice', () => {
	it('initializes with piano samples disabled', () => {
		const state = midiReducer(undefined, { type: 'unknown' });
		expect(state.pianoSamplesEnabled).to.equal(false);
	});

	it('toggles piano samples enabled', () => {
		let state = midiReducer(baseState, midiActions.setPianoSamplesEnabled(true));
		expect(state.pianoSamplesEnabled).to.equal(true);

		state = midiReducer(state, midiActions.setPianoSamplesEnabled(false));
		expect(state.pianoSamplesEnabled).to.equal(false);
	});
});
