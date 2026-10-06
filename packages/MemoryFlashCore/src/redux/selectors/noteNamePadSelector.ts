import { createSelector } from '@reduxjs/toolkit';
import { NOTE_NAME_PAD_ROOT, PITCH_CLASS_NAMES } from '../../lib/noteNames';
import { ReduxState } from '../store';

export const noteNamePadKeysSelector = createSelector(
	[(s: ReduxState) => s.midi.notes, (s: ReduxState) => s.midi.wrongNotes],
	(notes, wrongNotes) =>
		PITCH_CLASS_NAMES.map((names, pitchClass) => {
			const number = NOTE_NAME_PAD_ROOT + pitchClass;
			return {
				names,
				label: names.join('/'),
				pitchClass,
				held: notes.some((n) => n.number === number),
				wrong: wrongNotes.includes(number),
			};
		}),
);
