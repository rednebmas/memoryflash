import { Note } from 'tonal';
import useDeepCompareEffect from 'use-deep-compare-effect';
import { recordAttempt } from 'MemoryFlashCore/src/redux/actions/record-attempt-action';
import { midiActions } from 'MemoryFlashCore/src/redux/slices/midiSlice';
import { schedulerActions } from 'MemoryFlashCore/src/redux/slices/schedulerSlice';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { Card } from 'MemoryFlashCore/src/types/Cards';
import { MultiSheetCard } from 'MemoryFlashCore/src/types/MultiSheetCard';

export const ExactMultiAnswerValidator: React.FC<{ card: Card }> = ({ card: _card }) => {
	let card = _card as MultiSheetCard;

	const dispatch = useAppDispatch();
	const onNotes = useAppSelector((state) => state.midi.notes);
	const waitingUntilEmpty = useAppSelector((state) => state.midi.waitingUntilEmpty);
	const multiPartCardIndex = useAppSelector((state) => state.scheduler.multiPartCardIndex);
	const onNotesMidi = onNotes.map((note) => note.number);

	const part = card.question.voices.map((voice) => voice.stack[multiPartCardIndex].notes).flat();
	const answerPartNotesMidi = part.map((note) => Note.midi(note.name + note.octave));
	// useDeepCompareEffect(() => {
	// 	console.log('card:', card);
	// 	console.log('part:', part);
	// }, [card]);

	useDeepCompareEffect(() => {
		if (waitingUntilEmpty) return;
		for (let i = 0; i < onNotesMidi.length; i++) {
			if (!answerPartNotesMidi.includes(onNotesMidi[i])) {
				dispatch(recordAttempt(false));
				dispatch(midiActions.addWrongNote(onNotesMidi[i]));
				return;
			}
		}

		if (onNotes.length === answerPartNotesMidi.length) {
			if (multiPartCardIndex == card.question.voices[0].stack.length - 1) {
				console.log('Correct card!');
				dispatch(recordAttempt(true));
			} else {
				dispatch(midiActions.waitUntilEmpty());
				dispatch(schedulerActions.incrementMultiPartCardIndex());
			}
		}
	}, [onNotesMidi, answerPartNotesMidi, waitingUntilEmpty]);

	return null;
};
