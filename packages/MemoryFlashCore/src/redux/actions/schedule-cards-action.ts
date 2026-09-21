import { schedulers } from '../../lib/schedulers';
import {
	activeSchedulerSelector,
	currDeckReviewsSelector,
} from '../selectors/activeSchedulerSelector';
import { currDeckWithCorrectAttemptsSortedArray } from '../selectors/currDeckCardsWithAttempts';
import { schedulerActions } from '../slices/schedulerSlice';
import { SyncAppThunk } from '../store';

export const schedule =
	(deckId: string): SyncAppThunk =>
	(dispatch, getState) => {
		const state = getState();
		if (state.scheduler.deck !== deckId) return;
		if (state.scheduler.nextCards.length > 12) return;

		const scheduledCards = schedulers[activeSchedulerSelector(state)].pickNext({
			cards: currDeckWithCorrectAttemptsSortedArray(state),
			reviews: currDeckReviewsSelector(state),
			queued: state.scheduler.nextCards,
			now: Date.now(),
			random: Math.random,
		});
		dispatch(schedulerActions.addToNextCards(scheduledCards));
	};

export const reschedule =
	(deckId: string): SyncAppThunk =>
	(dispatch) => {
		dispatch(schedulerActions.resetQueue());
		dispatch(schedule(deckId));
	};
