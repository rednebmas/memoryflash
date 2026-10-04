import { ReduxState } from '../store';
import { Card, CardTypeEnum } from '../../types/Cards';

export const isDeckOwnerSelector = (state: ReduxState, deckId: string): boolean => {
	const user = state.auth.user;
	const deck = state.decks.entities[deckId];
	if (!user || !deck) return false;
	return state.courses.entities[deck.courseId]?.userId === user._id;
};

export type EditableCard = Extract<Card, { type: CardTypeEnum.MultiSheet }>;
export type EditCardStatus = EditableCard | 'loading' | 'missing';

export const editCardSelector = (
	state: ReduxState,
	deckId: string,
	cardId: string,
): EditCardStatus => {
	const card = state.cards.entities[cardId];
	const editable =
		card?.deckId === deckId &&
		card.type === CardTypeEnum.MultiSheet &&
		isDeckOwnerSelector(state, deckId);
	if (editable) return card;
	const network = state.network._['getDeck' + deckId];
	return !network || network.isLoading ? 'loading' : 'missing';
};
