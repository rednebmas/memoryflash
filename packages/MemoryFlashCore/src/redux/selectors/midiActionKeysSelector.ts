import { createSelector } from '@reduxjs/toolkit';
import { Midi } from 'tonal';
import { ReduxState } from '../store';
import {
	DEFAULT_MIDI_ACTION_KEYS,
	MIDI_ACTIONS,
	MIDI_ACTION_LABELS,
	MidiActionKeys,
} from '../../lib/midiActionKeys';

export const midiActionKeysSelector = createSelector(
	[(state: ReduxState) => state.settings.midiActionKeys],
	(stored): MidiActionKeys => ({ ...DEFAULT_MIDI_ACTION_KEYS, ...stored }),
);

export const midiActionKeyRowsSelector = createSelector(
	[midiActionKeysSelector, (state: ReduxState) => state.midi.learningActionKey],
	(keys, learning) =>
		MIDI_ACTIONS.map((action) => {
			const note = keys[action];
			return {
				action,
				label: MIDI_ACTION_LABELS[action],
				keyName: note === null ? undefined : Midi.midiToNoteName(note, { sharps: true }),
				learning: learning === action,
			};
		}),
);
