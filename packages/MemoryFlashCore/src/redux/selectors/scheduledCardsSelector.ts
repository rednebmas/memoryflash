import { createSelector } from '@reduxjs/toolkit';
import { ReduxState } from '../store';
import { currDeckWithAttemptsSelector } from './currDeckCardsWithAttempts';

const selectScheduler = (state: ReduxState) => state.scheduler;

export const scheduledCardsSelector = createSelector(
	[currDeckWithAttemptsSelector, selectScheduler],
	(currentDeck, schedulerRedux) => {
		return schedulerRedux.nextCards.map((cardId) => currentDeck[cardId]).filter(Boolean);
	},
);

export const answeredCardsSelector = createSelector(
	[currDeckWithAttemptsSelector, selectScheduler],
	(currentDeck, schedulerRedux) => {
		return schedulerRedux.answeredCards.map((cardId) => currentDeck[cardId]).filter(Boolean);
	},
);

export const sessionCardsSelector = createSelector(
	[scheduledCardsSelector, answeredCardsSelector],
	(scheduledCards, answeredCards) => {
		return {
			cards: [...answeredCards, ...scheduledCards],
			index: answeredCards.length,
		};
	},
);
