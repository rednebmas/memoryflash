import { createSelector } from '@reduxjs/toolkit';
import { schedulers } from '../../lib/schedulers';
import { SCHEDULER_IDS, SchedulerChoice, SchedulerId } from '../../lib/schedulers/types';
import { AnswerType } from '../../types/Cards';
import { ReduxState } from '../store';
import { chordInputModeSelector } from './chordInputModeSelector';
import { currDeckWithAttemptsSelector } from './currDeckCardsWithAttempts';
import { userDeckStatsByDeckIdSelector } from './userDeckStatsByDeckIdSelector';

const currDeckStatsSelector = createSelector(
	[userDeckStatsByDeckIdSelector, (state: ReduxState) => state.scheduler.deck],
	(statsByDeckId, deckId) => (deckId ? statsByDeckId[deckId] : undefined),
);

export const deckSchedulerChoiceSelector = createSelector(
	[currDeckStatsSelector],
	(stats): SchedulerChoice => stats?.scheduler ?? 'auto',
);

const deckAcceptsChordNamesSelector = createSelector([currDeckWithAttemptsSelector], (cards) => {
	const list = Object.values(cards);
	return list.length > 0 && list.every((card) => card.answer.type === AnswerType.ChordMemory);
});

export const autoSchedulerSelector = createSelector(
	[chordInputModeSelector, deckAcceptsChordNamesSelector],
	(mode, acceptsChordNames): SchedulerId =>
		mode === 'names' && acceptsChordNames ? 'recall' : 'speed',
);

export const activeSchedulerSelector = createSelector(
	[deckSchedulerChoiceSelector, autoSchedulerSelector],
	(choice, auto): SchedulerId => (choice === 'auto' ? auto : choice),
);

export const currDeckReviewsSelector = createSelector(
	[currDeckStatsSelector, (state: ReduxState) => state.scheduler.sessionReviews],
	(stats, sessionReviews) => ({ ...stats?.reviews, ...sessionReviews }),
);

export const nextDueSelector = createSelector(
	[currDeckWithAttemptsSelector, currDeckReviewsSelector],
	(cards, reviews): string | undefined =>
		Object.keys(cards)
			.flatMap((id) => (reviews[id] ? [reviews[id].due] : []))
			.sort()[0],
);

const deckLoadingSelector = (state: ReduxState) =>
	state.network._[`getDeck${state.scheduler.deck}`]?.isLoading ?? true;

export const caughtUpSelector = createSelector(
	[
		activeSchedulerSelector,
		currDeckWithAttemptsSelector,
		(state: ReduxState) => state.scheduler.currCard,
		deckLoadingSelector,
	],
	(active, cards, currCard, loading) =>
		active === 'recall' && !loading && !currCard && Object.keys(cards).length > 0,
);

export const schedulerOptionsSelector = createSelector([autoSchedulerSelector], (auto) => [
	{ value: 'auto' as SchedulerChoice, text: `Auto · ${schedulers[auto].label}` },
	...SCHEDULER_IDS.map((id) => ({ value: id as SchedulerChoice, text: schedulers[id].label })),
]);
