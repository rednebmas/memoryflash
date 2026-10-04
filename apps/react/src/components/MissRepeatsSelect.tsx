import React from 'react';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { MISS_REPEAT_OPTIONS } from 'MemoryFlashCore/src/lib/schedulers/types';
import { updateDeckScheduler } from 'MemoryFlashCore/src/redux/actions/update-deck-scheduler-action';
import {
	missRepeatsSelector,
	requeuesOnMissSelector,
} from 'MemoryFlashCore/src/redux/selectors/activeSchedulerSelector';
import { InlineSelect } from './inputs/InlineSelect';

export const MissRepeatsSelect: React.FC = () => {
	const dispatch = useAppDispatch();
	const deckId = useAppSelector((state) => state.scheduler.deck);
	const requeues = useAppSelector(requeuesOnMissSelector);
	const missRepeats = useAppSelector(missRepeatsSelector);
	if (!deckId || !requeues) return null;
	return (
		<InlineSelect
			label="Repeat a missed card"
			value={missRepeats}
			options={MISS_REPEAT_OPTIONS}
			onChange={(value) => dispatch(updateDeckScheduler(deckId, { missRepeats: value }))}
		/>
	);
};
