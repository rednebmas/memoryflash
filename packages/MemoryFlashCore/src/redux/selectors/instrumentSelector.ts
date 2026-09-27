import { createSelector } from '@reduxjs/toolkit';
import { ReduxState } from '../store';
import { AnswerType, CardTypeEnum } from '../../types/Cards';
import { sessionCardsSelector } from './scheduledCardsSelector';
import { DEFAULT_HOLD_MS } from '../../lib/saxPitch';
import { singleNoteName } from '../../lib/noteNames';

export const instrumentSelector = (state: ReduxState) => state.settings.instrument ?? 'piano';
export const showSaxFingeringsSelector = (state: ReduxState) => !!state.settings.showSaxFingerings;
export const saxTypeSelector = (state: ReduxState) => state.settings.saxType ?? 'alto';
export const saxHoldMsSelector = (state: ReduxState) => state.settings.saxHoldMs ?? DEFAULT_HOLD_MS;

export const currentSheetCardSelector = createSelector(
	[sessionCardsSelector],
	({ cards, index }) => {
		const card = cards[index];
		if (card?.type !== CardTypeEnum.MultiSheet) return undefined;
		return card.answer.type === AnswerType.ExactMulti ? card : undefined;
	},
);

export const saxModeSelector = createSelector(
	[instrumentSelector, currentSheetCardSelector],
	(instrument, card) => instrument === 'sax' && !!card,
);

export const currentNoteNameSelector = createSelector([currentSheetCardSelector], (card) =>
	card ? singleNoteName(card.question) : undefined,
);

export const noteNamesModeSelector = createSelector(
	[instrumentSelector, currentNoteNameSelector],
	(instrument, name) => instrument === 'names' && !!name,
);

export const currentCardIsNaturalSelector = createSelector([currentSheetCardSelector], (card) =>
	card
		? card.question.voices.every((v) =>
				v.stack.every((s) => s.notes.every((n) => n.name.length === 1)),
			)
		: false,
);
