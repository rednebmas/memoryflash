import { Card } from '../../models/Card';
import { Deck } from '../../models/Deck';
import { BaseAnswer, CardTypeBase, CardTypeEnum } from 'MemoryFlashCore/src/types/Cards';
import { DeckWithoutGeneratedFields } from 'MemoryFlashCore/src/types/Deck';
import { AnyBulkWriteOperation } from 'mongoose';

export async function upsertDeckWithCards<T extends CardTypeEnum, Q extends {}>(
	deck: DeckWithoutGeneratedFields,
	cards: CardTypeBase<T, Q>[],
) {
	let deckEntity = await Deck.findOne({ uid: deck.uid });
	if (!deckEntity) {
		deckEntity = new Deck();
		Object.assign(deckEntity, deck);
		deckEntity.cardCount = cards.length;
		await deckEntity.save();
	} else {
		await Deck.updateOne(
			{ _id: deckEntity._id },
			{ $set: { ...deck, cardCount: cards.length } },
		);
	}

	// Collect UIDs of the cards to keep
	const cardUIDs = cards.map((card) => card.uid);

	// Prepare bulk operations for upserting cards
	const bulkOps: AnyBulkWriteOperation[] = cards.map((card) => ({
		updateOne: {
			filter: { uid: card.uid, deckId: deckEntity._id },
			update: { $set: { ...card, deckId: deckEntity._id } },
			upsert: true,
		},
	}));

	// Delete cards not in the cardUIDs array
	bulkOps.push({
		deleteMany: {
			filter: { deckId: deckEntity._id, uid: { $nin: cardUIDs } },
		},
	});

	await Card.bulkWrite(bulkOps);

	console.log('Done syncing deck ' + deck.name);
	return { deck: deckEntity };
}
