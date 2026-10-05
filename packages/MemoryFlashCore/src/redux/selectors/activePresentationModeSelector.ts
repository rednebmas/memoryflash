import { createSelector } from '@reduxjs/toolkit';
import { ReduxState } from '../store';
import { sessionCardsSelector } from './scheduledCardsSelector';
import { currDeckAllWithAttemptsSelector } from './currDeckCardsWithAttempts';
import { activePresentationMode, availablePresentationModes } from '../../lib/presentationMode';
import { Card } from '../../types/Cards';
import { PresentationModeIds } from '../../types/PresentationMode';

export type PresentationModePillGroup = {
	cardType: string;
	modes: PresentationModeIds[];
	active: PresentationModeIds;
};

const getPresentationModesByQuestionType = (state: ReduxState) => state.settings.presentationModes;

const selectCurrentCard = createSelector(
	[sessionCardsSelector],
	({ cards, index }) => cards[index],
);

const unique = <T>(items: T[]) => Array.from(new Set(items));

const pillGroups = (
	cards: Card[],
	preferred: { [cardType: string]: PresentationModeIds },
): PresentationModePillGroup[] => {
	return unique(cards.map((c) => c.type))
		.map((cardType) => ({
			cardType,
			modes: unique(
				cards
					.filter((c) => c.type === cardType)
					.flatMap((c) => availablePresentationModes(c).map((m) => m.id)),
			),
		}))
		.filter(({ modes }) => modes.length)
		.map(({ cardType, modes }) => ({
			cardType,
			modes,
			active: modes.includes(preferred[cardType]) ? preferred[cardType] : modes[0],
		}));
};

export const selectStudyPresentationModePills = createSelector(
	[selectCurrentCard, getPresentationModesByQuestionType],
	(card, preferred) => (card ? pillGroups([card], preferred) : []),
);

export const selectDeckPresentationModePills = createSelector(
	[currDeckAllWithAttemptsSelector, getPresentationModesByQuestionType],
	(cards, preferred) =>
		pillGroups(Object.values(cards), preferred).filter(({ modes }) => modes.length > 1),
);

export const selectActivePresentationMode = createSelector(
	[getPresentationModesByQuestionType, selectCurrentCard],
	(preferred, card) => (card && activePresentationMode(card, preferred)?.id) ?? null,
);
