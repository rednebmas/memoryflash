import { useMemo, useState } from 'react';
import useDeepCompareEffect from 'use-deep-compare-effect';
import { recordAttempt } from 'MemoryFlashCore/src/redux/actions/record-attempt-action';
import { midiActions } from 'MemoryFlashCore/src/redux/slices/midiSlice';
import { schedulerActions } from 'MemoryFlashCore/src/redux/slices/schedulerSlice';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { Card } from 'MemoryFlashCore/src/types/Cards';
import { MultiSheetCard } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { buildNoteTimeline } from './tieUtils';

export const ExactMultiAnswerValidator: React.FC<{ card: Card }> = ({ card: _card }) => {
	const card = _card as MultiSheetCard;
	const timeline = useMemo(() => buildNoteTimeline(card), [card]);
	const dispatch = useAppDispatch();
	const onNotes = useAppSelector((s) => s.midi.notes).map((n) => n.number);
	const waitingUntilEmpty = useAppSelector((s) => s.midi.waitingUntilEmpty);
	const multiPartCardIndex = useAppSelector((s) => s.scheduler.multiPartCardIndex);
	const [lastCheckpointIndex, setLastCheckpointIndex] = useState(0);

	const resetTo = (idx: number) => {
		dispatch(schedulerActions.startFromBeginningOfCurrentCard());
		for (let i = 0; i < idx; i++) dispatch(schedulerActions.incrementMultiPartCardIndex());
	};

	useDeepCompareEffect(() => {
		if (waitingUntilEmpty) return;
		const state = timeline[multiPartCardIndex];
		if (!state) return;
		const expected = [...state.startNotes, ...state.carryNotes];
		const allCarryHeld = state.carryNotes.every((n) => onNotes.includes(n));
		const noUnexpected = onNotes.every((n) => expected.includes(n));
		if (!allCarryHeld || !noUnexpected) {
			dispatch(recordAttempt(false));
			resetTo(lastCheckpointIndex);
			dispatch(midiActions.waitUntilEmpty());
			return;
		}
		if (onNotes.length === expected.length && allCarryHeld) {
			setLastCheckpointIndex(multiPartCardIndex);
			if (multiPartCardIndex === timeline.length - 1) {
				dispatch(recordAttempt(true));
			} else {
				dispatch(schedulerActions.incrementMultiPartCardIndex());
			}
		}
	}, [onNotes, waitingUntilEmpty, multiPartCardIndex, timeline]);
	return null;
};
