import { CardWithAttempts } from 'MemoryFlashCore/src/redux/selectors/currDeckCardsWithAttempts';
import { useAppSelector } from 'MemoryFlashCore/src/redux/store';

export function useIsCardOwner(card: CardWithAttempts): boolean {
	return useAppSelector((state) => {
		const user = state.auth.user;
		if (!user) return false;
		const deck = state.decks.entities[card.deckId];
		if (!deck) return false;
		const course = state.courses.entities[deck.courseId];
		return course?.userId === user._id;
	});
}
