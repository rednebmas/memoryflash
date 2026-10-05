import { createSelector } from '@reduxjs/toolkit';
import { ReduxState } from '../store';
import { missRepeatsSelector } from './activeSchedulerSelector';

export const retryStatusSelector = createSelector(
	[
		(s: ReduxState) => s.scheduler.incorrect,
		(s: ReduxState) => s.scheduler.retryStreak,
		missRepeatsSelector,
	],
	(incorrect, streak, repeats): string | undefined => {
		if (!incorrect && streak === undefined) return undefined;
		const left = incorrect || streak === undefined ? repeats : repeats - streak;
		return `Missed · play it right ${left} more ${left === 1 ? 'time' : 'times'}`;
	},
);
