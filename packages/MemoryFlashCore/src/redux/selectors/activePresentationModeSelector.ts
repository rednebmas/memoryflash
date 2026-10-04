import { createSelector } from '@reduxjs/toolkit';
import { ReduxState } from '../store';
import { sessionCardsSelector } from './scheduledCardsSelector';
import { activePresentationMode } from '../../lib/presentationMode';

const getPresentationModesByQuestionType = (state: ReduxState) => state.settings.presentationModes;

export const selectActivePresentationMode = createSelector(
	[getPresentationModesByQuestionType, sessionCardsSelector],
	(preferred, { cards, index }) => {
		const card = cards[index];
		return (card && activePresentationMode(card, preferred)?.id) ?? null;
	},
);
