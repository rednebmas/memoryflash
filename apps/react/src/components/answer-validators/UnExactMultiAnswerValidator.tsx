import { Midi, Note } from 'tonal';
import useDeepCompareEffect from 'use-deep-compare-effect';
import { recordAttempt } from 'MemoryFlashCore/src/redux/actions/record-attempt-action';
import { midiActions } from 'MemoryFlashCore/src/redux/slices/midiSlice';
import { schedulerActions } from 'MemoryFlashCore/src/redux/slices/schedulerSlice';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { Card } from 'MemoryFlashCore/src/types/Cards';
import { MultiSheetCard } from 'MemoryFlashCore/src/types/MultiSheetCard';

export const UnExactMultiAnswerValidator: React.FC<{ card: Card }> = ({ card: _card }) => {
	let card = _card as MultiSheetCard;

	const dispatch = useAppDispatch();
	const onNotes = useAppSelector((state) => state.midi.notes);
	const onNotesChroma = onNotes.map((note) => Note.chroma(Midi.midiToNoteName(note.number)));
	const onNotesMidi = onNotes.map((note) => note.number);
	const waitingUntilEmpty = useAppSelector((state) => state.midi.waitingUntilEmpty);
	const multiPartCardIndex = useAppSelector((state) => state.scheduler.multiPartCardIndex);

	const part = card.question.voices.map((voice) => voice.stack[multiPartCardIndex].notes).flat();
	const answerPartNotesChroma = part
		.sort((a, b) => {
			const noteA = Note.midi(a.name + a.octave);
			const noteB = Note.midi(b.name + b.octave);
			if (noteA && noteB) {
				return noteA - noteB;
			}
			return 0;
		})
		.map((note) => Note.chroma(note.name + note.octave));

	useDeepCompareEffect(() => {
		if (waitingUntilEmpty) return;
		for (let i = 0; i < onNotesChroma.length; i++) {
			if (!answerPartNotesChroma.includes(onNotesChroma[i])) {
				dispatch(recordAttempt(false));
				dispatch(midiActions.addWrongNote(onNotesMidi[i]));
				return;
			}
		}

		// order should be correct to get answer correct
		for (let i = 0; i < onNotesChroma.length; i++) {
			if (answerPartNotesChroma[i] !== onNotesChroma[i]) {
				console.log(
					'[UnExactMultiAnswerValidator] Incorrect order: ',
					onNotesChroma[i],
					answerPartNotesChroma[i],
					onNotes[i],
					part,
				);

				return;
			} else {
				console.log('[UnExactMultiAnswerValidator] Correct order: ', onNotesChroma[i]);
			}
		}

		if (onNotes.length === answerPartNotesChroma.length) {
			if (multiPartCardIndex == card.question.voices[0].stack.length - 1) {
				console.log('Correct card!');
				dispatch(recordAttempt(true));
			} else {
				dispatch(midiActions.waitUntilEmpty());
				dispatch(schedulerActions.incrementMultiPartCardIndex());
			}
		}
	}, [onNotesChroma, answerPartNotesChroma, waitingUntilEmpty]);

	return null;
};
