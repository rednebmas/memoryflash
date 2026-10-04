import { ReduxState } from '../store';
import { CardTypeEnum } from '../../types/Cards';
import { groupKeys } from '../../lib/transpositionGroups';
import { selectHiddenCardIds } from './currDeckCardsWithAttempts';

export const selectTranspositionGroupKeys = (state: ReduxState, cardId: string | undefined) => {
	const source = cardId ? state.cards.entities[cardId] : undefined;
	if (source?.type !== CardTypeEnum.MultiSheet) return [];
	const hiddenIds = selectHiddenCardIds(state, source.deckId);
	return groupKeys(Object.values(state.cards.entities), hiddenIds, source);
};
