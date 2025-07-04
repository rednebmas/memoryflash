import { Midi, Note } from 'tonal';
import useDeepCompareEffect from 'use-deep-compare-effect';
import { useState } from 'react';
import { recordAttempt } from 'MemoryFlashCore/src/redux/actions/record-attempt-action';
import { midiActions } from 'MemoryFlashCore/src/redux/slices/midiSlice';
import { schedulerActions } from 'MemoryFlashCore/src/redux/slices/schedulerSlice';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { Card } from 'MemoryFlashCore/src/types/Cards';
import { MultiSheetCard } from 'MemoryFlashCore/src/types/MultiSheetCard';

export const UnExactMultiAnswerValidator: React.FC<{ card: Card }> = ({ card: _card }) => {
	const card = _card as MultiSheetCard;

	const dispatch = useAppDispatch();
	const onNotes = useAppSelector((state) => state.midi.notes);
	const onNotesChroma = onNotes.map((note) => Note.chroma(Midi.midiToNoteName(note.number)));
	const onNotesMidi = onNotes.map((note) => note.number);
	const waitingUntilEmpty = useAppSelector((state) => state.midi.waitingUntilEmpty);
	const multiPartCardIndex = useAppSelector((state) => state.scheduler.multiPartCardIndex);

	const [wrongIndex, setWrongIndex] = useState(-1);

	const getChromaNotesForPart = (index: number): number[] => {
		return card.question.voices
			.flatMap((voice) => voice.stack[index].notes)
			.map((note) => Note.chroma(note.name + note.octave));
	};

	const answerPartNotesChroma = getChromaNotesForPart(multiPartCardIndex);
	const firstPartNotesChroma = getChromaNotesForPart(0);

	const areArraysEqual = (array1: number[], array2: number[]): boolean => {
		if (array1.length !== array2.length) return false;
		for (let i = 0; i < array1.length; i++) {
			if (array1[i] !== array2[i]) {
				return false;
			}
		}
		return true;
	};

	useDeepCompareEffect(() => {
		if (waitingUntilEmpty) return;

		// Allow restarting from the first index if the first part is played after an incorrect attempt
		if (
			multiPartCardIndex !== 0 &&
			wrongIndex === multiPartCardIndex &&
			areArraysEqual(onNotesChroma, firstPartNotesChroma)
		) {
			console.log('[scheduler] Restarting from the first part');
			dispatch(schedulerActions.startFromBeginningOfCurrentCard());
			setWrongIndex(-1);
			return;
		}

		// Validate notes for the current part
		for (let i = 0; i < onNotesChroma.length; i++) {
			if (!answerPartNotesChroma.includes(onNotesChroma[i])) {
				dispatch(recordAttempt(false));
				setWrongIndex(multiPartCardIndex);
				dispatch(midiActions.addWrongNote(onNotesMidi[i]));
				return;
			}
		}

		// Check order correctness
		if (!areArraysEqual(onNotesChroma, answerPartNotesChroma.slice(0, onNotesChroma.length))) {
			console.log(
				'[UnExactMultiAnswerValidator] Incorrect order: ',
				onNotesChroma,
				answerPartNotesChroma,
			);
			return;
		}

		if (onNotesChroma.length === answerPartNotesChroma.length) {
			if (multiPartCardIndex === card.question.voices[0].stack.length - 1) {
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
