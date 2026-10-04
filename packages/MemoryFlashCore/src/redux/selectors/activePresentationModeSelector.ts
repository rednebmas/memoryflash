import { createSelector } from '@reduxjs/toolkit';
import { ReduxState } from '../store';
import { sessionCardsSelector } from './scheduledCardsSelector';
import { activePresentationMode, availablePresentationModes } from '../../lib/presentationMode';

const getPresentationModesByQuestionType = (state: ReduxState) => state.settings.presentationModes;

const selectCurrentCard = createSelector(
	[sessionCardsSelector],
	({ cards, index }) => cards[index],
);

export const selectAvailablePresentationModes = createSelector([selectCurrentCard], (card) =>
	card ? availablePresentationModes(card) : [],
);

export const selectActivePresentationMode = createSelector(
	[getPresentationModesByQuestionType, selectCurrentCard],
	(preferred, card) => (card && activePresentationMode(card, preferred)?.id) ?? null,
);
