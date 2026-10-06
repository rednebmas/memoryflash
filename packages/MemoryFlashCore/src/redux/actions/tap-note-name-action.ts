import { NOTE_NAME_PAD_ROOT } from '../../lib/noteNames';
import { midiActions } from '../slices/midiSlice';
import { SyncAppThunk } from '../store';

export const tapNoteName =
	(pitchClass: number): SyncAppThunk =>
	(dispatch, getState) => {
		const number = NOTE_NAME_PAD_ROOT + pitchClass;
		const { notes, pendingClearClickedNotes } = getState().midi;
		const held = notes.some((n) => n.number === number);
		if (held && !pendingClearClickedNotes) return void dispatch(midiActions.removeNote(number));
		if (pendingClearClickedNotes) dispatch(midiActions.clearClickedNotes());
		dispatch(midiActions.addNote({ number, clicked: true, time: performance.now() }));
	};
