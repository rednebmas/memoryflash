import { CardTypeBase, CardTypeEnum } from '../../submodules/MemoryFlashCore/src/types/Cards';
import { DeckWithoutGeneratedFields as IDeck } from '../../submodules/MemoryFlashCore/src/types/Deck';
import { upsertDeckWithCards } from './upsert-deck-with-cards';
import { CourseDoc } from '../../models/Course';

export async function upsertCourse<T extends CardTypeEnum, Q extends {}>(
	course: CourseDoc,
	decks: [IDeck, CardTypeBase<T, Q>[]][],
) {
	const deckUIDMap: { [key: string]: boolean } = {};
	const cardUIDMap: { [key: string]: boolean } = {};

	decks.forEach(([deck, cards]) => {
		if (deckUIDMap[deck.uid]) {
			throw new Error(`MFlash Error: Deck with duplicated uid "${deck.uid}"`);
		}
		deckUIDMap[deck.uid] = true;

		cards.forEach((card) => {
			if (cardUIDMap[card.uid]) {
				throw new Error(`MFlash Error: Card with duplicated uid "${card.uid}"`);
			}
			cardUIDMap[card.uid] = true;
		});
	});

	const decksContainer = await Promise.all(
		decks.map(([deck, cards]) => upsertDeckWithCards(deck, cards)),
	);

	course.decks = decksContainer.map((container) => container.deck._id);
	await course.save();

	return { course, decks: decksContainer.map((c) => c.deck) };
}
