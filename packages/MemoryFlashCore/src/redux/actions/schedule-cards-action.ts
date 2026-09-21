import { schedulers } from '../../lib/schedulers';
import { CARDS_PER_BATCH } from '../../lib/schedulers/types';
import {
	activeSchedulerSelector,
	currDeckClockSelector,
	currDeckReviewsSelector,
} from '../selectors/activeSchedulerSelector';
import { currDeckWithCorrectAttemptsSortedArray } from '../selectors/currDeckCardsWithAttempts';
import { schedulerActions } from '../slices/schedulerSlice';
import { SyncAppThunk } from '../store';

export const schedule =
	(deckId: string, fill?: { to: number; exclude: string }): SyncAppThunk =>
	(dispatch, getState) => {
		const state = getState();
		if (state.scheduler.deck !== deckId) return;
		const { nextCards } = state.scheduler;
		if (nextCards.length > 12) return;

		const scheduledCards = schedulers[activeSchedulerSelector(state)].pickNext({
			cards: currDeckWithCorrectAttemptsSortedArray(state),
			reviews: currDeckReviewsSelector(state),
			queued: fill ? [...nextCards, fill.exclude] : nextCards,
			count: fill ? Math.max(0, fill.to - nextCards.length) : CARDS_PER_BATCH,
			clock: currDeckClockSelector(state),
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
