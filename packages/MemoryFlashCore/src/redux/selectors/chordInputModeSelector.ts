import { createSelector } from '@reduxjs/toolkit';
import { ReduxState } from '../store';
import { ChordInputMode } from '../slices/settingsSlice';
import { AnswerType } from '../../types/Cards';
import { sessionCardsSelector } from './scheduledCardsSelector';

const isNarrowScreen = (): boolean =>
	typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches;

export const chordInputModeSelector = createSelector(
	[(state: ReduxState) => state.settings.chordInputMode],
	(mode): ChordInputMode => mode ?? (isNarrowScreen() ? 'names' : 'piano'),
);

export const currentCardAcceptsChordNamesSelector = createSelector(
	[sessionCardsSelector],
	({ cards, index }) => cards[index]?.answer.type === AnswerType.ChordMemory,
);

export const showChordPadSelector = createSelector(
	[chordInputModeSelector, currentCardAcceptsChordNamesSelector],
	(mode, accepts) => mode === 'names' && accepts,
);
