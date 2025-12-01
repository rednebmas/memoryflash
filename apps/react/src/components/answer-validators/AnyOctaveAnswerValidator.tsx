import { Midi, Note } from 'tonal';
import useDeepCompareEffect from 'use-deep-compare-effect';
import { recordAttempt } from 'MemoryFlashCore/src/redux/actions/record-attempt-action';
import { midiActions } from 'MemoryFlashCore/src/redux/slices/midiSlice';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { AnyOctaveAnswer, Card } from 'MemoryFlashCore/src/types/Cards';

export const AnyOctaveAnswerValidator: React.FC<{ card: Card }> = ({ card }) => {
	const answer = card.answer as AnyOctaveAnswer;
	const dispatch = useAppDispatch();
	const onNotes = useAppSelector((state) => state.midi.notes);
	const waitingUntilEmpty = useAppSelector((state) => state.midi.waitingUntilEmpty);
	const onNotesChroma = onNotes.map((note) => Note.chroma(Midi.midiToNoteName(note.number)));
	const answerNotesChroma = answer.notes.map((note) => Note.chroma(note));

	useDeepCompareEffect(() => {
		if (waitingUntilEmpty) return;
		for (let i = 0; i < onNotes.length; i++) {
			if (!answerNotesChroma.includes(onNotesChroma[i])) {
				dispatch(recordAttempt(false));
				dispatch(midiActions.addWrongNote(onNotes[i].number));
				dispatch(midiActions.waitUntilEmpty());
				return;
			}
		}

		if (onNotes.length === answer.notes.length) {
			dispatch(midiActions.requestClearClickedNotes());
			dispatch(recordAttempt(true));
			console.log('Correct!');
		}
	}, [onNotes, answer.notes, waitingUntilEmpty]);

	return null;
};
