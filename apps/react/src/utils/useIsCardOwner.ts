import { CardWithAttempts } from 'MemoryFlashCore/src/redux/selectors/currDeckCardsWithAttempts';
import { isDeckOwnerSelector } from 'MemoryFlashCore/src/redux/selectors/editCardSelector';
import { User } from 'MemoryFlashCore/src/types/User';
import { useAppSelector } from 'MemoryFlashCore/src/redux/store';

export function useIsCardOwner(card: CardWithAttempts): boolean {
	return useAppSelector((state) => isDeckOwnerSelector(state, card.deckId));
}

export function isCardOwner(card: CardWithAttempts, user: User | undefined): boolean {
	if (!user || !card.userId) return false;
	return card.userId === user._id;
}
