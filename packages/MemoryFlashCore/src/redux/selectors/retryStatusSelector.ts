import { createSelector } from '@reduxjs/toolkit';
import { ReduxState } from '../store';
import { missRepeatsSelector } from './activeSchedulerSelector';

export const missedSelector = (s: ReduxState) =>
	Boolean(s.scheduler.incorrect) || s.scheduler.retryStreak !== undefined;

export const wrongNoteSelector = (s: ReduxState) => Boolean(s.scheduler.wrongNote);

export const canRestartCardSelector = wrongNoteSelector;

export const retryStatusSelector = createSelector(
	[
		missedSelector,
		(s: ReduxState) => s.scheduler.incorrect,
		(s: ReduxState) => s.scheduler.retryStreak,
		missRepeatsSelector,
	],
	(missed, incorrect, streak, repeats): string | undefined => {
		if (!missed) return undefined;
		const left = incorrect || streak === undefined ? repeats : repeats - streak;
		return `Missed · play it right ${left} more ${left === 1 ? 'time' : 'times'}`;
	},
);
