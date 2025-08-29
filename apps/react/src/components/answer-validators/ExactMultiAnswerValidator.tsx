import { Note } from 'tonal';
import useDeepCompareEffect from 'use-deep-compare-effect';
import { recordAttempt } from 'MemoryFlashCore/src/redux/actions/record-attempt-action';
import { midiActions } from 'MemoryFlashCore/src/redux/slices/midiSlice';
import { schedulerActions } from 'MemoryFlashCore/src/redux/slices/schedulerSlice';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { Card } from 'MemoryFlashCore/src/types/Cards';
import { MultiSheetCard } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { filterNullOrUndefined } from 'MemoryFlashCore/src/lib/filterNullOrUndefined';
import { useState } from 'react';

export const ExactMultiAnswerValidator: React.FC<{ card: Card }> = ({ card: _card }) => {
	const card = _card as MultiSheetCard;

	const dispatch = useAppDispatch();
	const onNotes = useAppSelector((state) => state.midi.notes);
	const waitingUntilEmpty = useAppSelector((state) => state.midi.waitingUntilEmpty);
	const multiPartCardIndex = useAppSelector((state) => state.scheduler.multiPartCardIndex);
	const onNotesMidi = onNotes.map((note) => note.number);

	const [wrongIndex, setWrongIndex] = useState(-1);

	// Helper function to get MIDI notes for a specific part index
	const getNotesForPart = (index: number) => {
		const partNotes = filterNullOrUndefined(
			card.question.voices
				.flatMap((voice) => voice.stack[index]?.notes ?? [])
				.map((note) => Note.midi(note.name + note.octave)),
		);
		return partNotes;
	};

	const answerPartNotesMidi = getNotesForPart(multiPartCardIndex);
	const firstPartNotesMidi = getNotesForPart(0);

	// Helper function to check if played notes match target notes (order-insensitive)
	const areNotesMatching = (playedNotes: number[], targetNotes: number[]): boolean => {
		return (
			playedNotes.length === targetNotes.length &&
			playedNotes.every((note) => targetNotes.includes(note))
		);
	};

	useDeepCompareEffect(() => {
		if (waitingUntilEmpty) return;

		// Allow restarting from the first index if the first part is played
		if (
			multiPartCardIndex != 0 &&
			wrongIndex == multiPartCardIndex &&
			areNotesMatching(onNotesMidi, firstPartNotesMidi)
		) {
			console.log('[scheduler] Restarting from the first part');
			dispatch(schedulerActions.startFromBeginningOfCurrentCard());
			setWrongIndex(-1);
			return;
		}

		// Validate notes for the current part
		if (!onNotesMidi.every((note) => answerPartNotesMidi.includes(note))) {
			dispatch(recordAttempt(false));
			setWrongIndex(multiPartCardIndex);
			dispatch(
				midiActions.addWrongNote(
					onNotesMidi.find((note) => !answerPartNotesMidi.includes(note))!,
				),
			);
			return;
		}

		// Check if the correct number of notes have been played
		if (onNotesMidi.length === answerPartNotesMidi.length) {
			if (multiPartCardIndex === card.question.voices[0].stack.length - 1) {
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
