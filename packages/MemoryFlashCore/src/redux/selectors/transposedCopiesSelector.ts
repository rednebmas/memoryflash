import { ReduxState } from '../store';
import { Card } from '../../types/Cards';
import { MultiSheetQuestion } from '../../types/MultiSheetCard';
import { transposedCopies, transposedCopyUpdates } from '../../lib/transposedCopies';

const allCards = (state: ReduxState): Card[] => Object.values(state.cards.entities);

export const selectTransposedCopyCount = (
	state: ReduxState,
	cardId: string | undefined,
	question: MultiSheetQuestion,
): number => {
	const source = cardId ? state.cards.entities[cardId] : undefined;
	return source ? transposedCopies(allCards(state), source, question).length : 0;
};

export const selectTransposedCopyUpdates = (
	state: ReduxState,
	cardId: string,
	question: MultiSheetQuestion,
) => {
	const source = state.cards.entities[cardId];
	return source ? transposedCopyUpdates(allCards(state), source, question) : [];
};
