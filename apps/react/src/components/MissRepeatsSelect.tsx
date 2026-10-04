import React from 'react';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { MISS_REPEAT_OPTIONS } from 'MemoryFlashCore/src/lib/schedulers/types';
import { updateDeckScheduler } from 'MemoryFlashCore/src/redux/actions/update-deck-scheduler-action';
import { missRepeatsSelector } from 'MemoryFlashCore/src/redux/selectors/activeSchedulerSelector';
import { InlineSelect } from './inputs/InlineSelect';

export const MissRepeatsSelect: React.FC = () => {
	const dispatch = useAppDispatch();
	const deckId = useAppSelector((state) => state.scheduler.deck);
	const missRepeats = useAppSelector(missRepeatsSelector);
	if (!deckId) return null;
	return (
		<InlineSelect
			label="After a miss, play it right"
			value={missRepeats}
			options={MISS_REPEAT_OPTIONS}
			onChange={(value) => dispatch(updateDeckScheduler(deckId, { missRepeats: value }))}
		/>
	);
};
