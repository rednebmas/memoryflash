import useDeepCompareEffect from 'use-deep-compare-effect';
import { useMemo, useState } from 'react';
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
	const onNotesMidi = useAppSelector((s) => s.midi.notes.map((n) => n.number));
	const waiting = useAppSelector((s) => s.midi.waitingUntilEmpty);
	const idx = useAppSelector((s) => s.scheduler.multiPartCardIndex);
	const [lastCheckpoint, setLastCheckpoint] = useState(0);

	useDeepCompareEffect(() => {
		if (waiting) return;
		const state = timeline[idx];
		if (!state) return;
		const expected = [...state.startNotes, ...state.carryNotes];
		const extra = onNotesMidi.filter((n) => !expected.includes(n));
		const missingCarry = state.carryNotes.some((n) => !onNotesMidi.includes(n));
		if (extra.length || missingCarry) {
			dispatch(recordAttempt(false));
			dispatch(midiActions.waitUntilEmpty());
			dispatch(schedulerActions.startFromBeginningOfCurrentCard());
			for (let i = 0; i < lastCheckpoint; i++)
				dispatch(schedulerActions.incrementMultiPartCardIndex());
			return;
		}
		const hasAll = expected.every((n) => onNotesMidi.includes(n));
		if (hasAll && onNotesMidi.length === expected.length) {
			const next = idx + 1;
			if (next >= timeline.length) {
				dispatch(recordAttempt(true));
			} else {
				dispatch(schedulerActions.incrementMultiPartCardIndex());
				setLastCheckpoint(next);
			}
		}
	}, [onNotesMidi, waiting, idx, timeline, lastCheckpoint]);

	return null;
};
