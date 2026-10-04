import { CardTypeBase, CardTypeEnum } from 'MemoryFlashCore/src/types/Cards';
import { DeckWithoutGeneratedFields as IDeck } from 'MemoryFlashCore/src/types/Deck';
import { upsertDeckWithCards } from './upsert-deck-with-cards';
import Course, { CourseDoc } from '../../models/Course';
import { Deck } from '../../models/Deck';
import { purgeDeck } from '../deckService';

export const findOrCreateSystemCourse = async (name: string) =>
	(await Course.findOne({ name, userId: { $exists: false } })) ?? new Course({ name, decks: [] });

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

	const previousDeckIds = course.decks.map(String);
	course.decks = decksContainer.map((container) => container.deck._id);
	await course.save();

	const keptDeckIds = course.decks.map(String);
	const staleDecks = await Deck.find({
		_id: { $in: previousDeckIds.filter((id) => !keptDeckIds.includes(id)) },
	});
	await Promise.all(staleDecks.map(purgeDeck));

	return { course, decks: decksContainer.map((c) => c.deck) };
}
