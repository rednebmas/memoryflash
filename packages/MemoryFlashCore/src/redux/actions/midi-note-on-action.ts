import { Action } from '@reduxjs/toolkit';
import { MidiActionKey, midiActionForNote } from '../../lib/midiActionKeys';
import { midiActionKeysSelector } from '../selectors/midiActionKeysSelector';
import { MidiNote, midiActions } from '../slices/midiSlice';
import { rhythmActions } from '../slices/rhythmSlice';
import { settingsActions } from '../slices/settingsSlice';
import { SyncAppThunk } from '../store';
import { restartCard } from './restart-card-action';
import { saveSetting } from './save-setting-action';

const runMidiAction: Record<MidiActionKey, () => Action | SyncAppThunk> = {
	restartCard,
	toggleMetronome: rhythmActions.toggleMetronome,
};

export const midiNoteOn =
	(note: MidiNote): SyncAppThunk =>
	(dispatch, getState) => {
		const learning = getState().midi.learningActionKey;
		if (learning) {
			dispatch(
				saveSetting(
					settingsActions.setMidiActionKey({ action: learning, note: note.number }),
				),
			);
			dispatch(midiActions.learnActionKey(undefined));
			return;
		}
		const action = midiActionForNote(midiActionKeysSelector(getState()), note.number);
		if (action) dispatch(runMidiAction[action]());
		else dispatch(midiActions.addNote(note));
	};
