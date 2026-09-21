import React from 'react';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { updateDeckScheduler } from 'MemoryFlashCore/src/redux/actions/update-deck-scheduler-action';
import {
	deckSchedulerChoiceSelector,
	schedulerOptionsSelector,
} from 'MemoryFlashCore/src/redux/selectors/activeSchedulerSelector';
import { SegmentedPicker } from './ui/SegmentedPicker';

export const SchedulerPicker: React.FC = () => {
	const dispatch = useAppDispatch();
	const deckId = useAppSelector((state) => state.scheduler.deck);
	const choice = useAppSelector(deckSchedulerChoiceSelector);
	const options = useAppSelector(schedulerOptionsSelector);
	if (!deckId) return null;
	return (
		<SegmentedPicker
			options={options}
			value={choice}
			onChange={(value) => dispatch(updateDeckScheduler(deckId, value))}
		/>
	);
};
