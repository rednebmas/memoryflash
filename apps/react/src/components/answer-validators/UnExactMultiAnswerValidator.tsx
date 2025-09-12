import { Midi, Note } from 'tonal';
import useDeepCompareEffect from 'use-deep-compare-effect';
import { useState } from 'react';
import { recordAttempt } from 'MemoryFlashCore/src/redux/actions/record-attempt-action';
import { midiActions } from 'MemoryFlashCore/src/redux/slices/midiSlice';
import { schedulerActions } from 'MemoryFlashCore/src/redux/slices/schedulerSlice';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { Card } from 'MemoryFlashCore/src/types/Cards';
import { MultiSheetCard } from 'MemoryFlashCore/src/types/MultiSheetCard';

// Notes may be played in any order, but the resulting chroma sequence must match the card
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
			.flatMap((voice) => voice.stack[index]?.notes ?? [])
			.map((note) => ({
				chroma: Note.chroma(note.name + note.octave),
				midi: Note.midi(note.name + note.octave) ?? 0,
			}))
			.sort((a, b) => a.midi - b.midi)
			.map((n) => n.chroma);
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
		if (waitingUntilEmpty) {
			return;
		}

		// Allow restarting from the first index if the first part is played after an incorrect attempt
		if (
			multiPartCardIndex !== 0 &&
			wrongIndex === multiPartCardIndex &&
			areArraysEqual(onNotesChroma, firstPartNotesChroma)
		) {
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

		const partComplete = onNotesChroma.length === answerPartNotesChroma.length;
		if (partComplete) {
			if (areArraysEqual(onNotesChroma, answerPartNotesChroma)) {
				if (multiPartCardIndex === card.question.voices[0].stack.length - 1) {
					dispatch(recordAttempt(true));
				} else {
					dispatch(midiActions.waitUntilEmpty());
					dispatch(schedulerActions.incrementMultiPartCardIndex());
				}
			} else {
				alert('Correct notes but incorrect order');
			}
		}
	}, [onNotesChroma, answerPartNotesChroma, waitingUntilEmpty]);

	return null;
};
