import { createSelector } from '@reduxjs/toolkit';
import { ReduxState } from '../store';
import { sessionCardsSelector } from './scheduledCardsSelector';

const getPresentationModesByQuestionType = (state: ReduxState) => state.settings.presentationModes;

export const selectActivePresentationMode = createSelector(
	[getPresentationModesByQuestionType, sessionCardsSelector],
	(presentationModesByQuestionType, sessionCards) => {
		const card = sessionCards.cards[sessionCards.index];
		if (!card || !card?.question.presentationModes?.length) return null;

		return presentationModesByQuestionType[card.type];
	},
);
