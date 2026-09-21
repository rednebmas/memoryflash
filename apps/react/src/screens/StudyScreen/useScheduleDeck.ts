import { useEffect, useRef } from 'react';
import { getDeck } from 'MemoryFlashCore/src/redux/actions/get-deck-action';
import { reschedule, schedule } from 'MemoryFlashCore/src/redux/actions/schedule-cards-action';
import { activeSchedulerSelector } from 'MemoryFlashCore/src/redux/selectors/activeSchedulerSelector';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';

export const useScheduleDeck = (deckId?: string) => {
	const dispatch = useAppDispatch();
	const activeScheduler = useAppSelector(activeSchedulerSelector);
	const prevScheduler = useRef(activeScheduler);

	useEffect(() => {
		if (deckId) {
			dispatch(getDeck(deckId)).then(() => {
				dispatch(schedule(deckId));
			});
		}
	}, [deckId, dispatch]);

	useEffect(() => {
		if (deckId && prevScheduler.current !== activeScheduler) dispatch(reschedule(deckId));
		prevScheduler.current = activeScheduler;
	}, [activeScheduler]);
};
