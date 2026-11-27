import { activeSkippedCardIds } from '../../lib/skippedCards';
import { ReduxState } from '../store';
import { currDeckStatsSelector } from './activeSchedulerSelector';
import { currDeckWithAttemptsSelector } from './currDeckCardsWithAttempts';

export const activeSkippedCardIdsSelector = (state: ReduxState, now = new Date()) =>
	activeSkippedCardIds(
		currDeckStatsSelector(state)?.skippedCards,
		Object.values(currDeckWithAttemptsSelector(state)),
		now,
	);

export const activeSkippedCardsSelector = (state: ReduxState, now = new Date()) => {
	const skipped = currDeckStatsSelector(state)?.skippedCards ?? {};
	return Object.fromEntries(
		activeSkippedCardIdsSelector(state, now).map((id) => [id, skipped[id]]),
	);
};
