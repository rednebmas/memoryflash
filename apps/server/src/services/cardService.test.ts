import { expect } from 'chai';
import { seed } from '../config/test-seed';
import { setupDBConnectionForTesting } from '../config/test-setup';
import { Card } from '../models/Card';
import Course from '../models/Course';
import { Deck } from '../models/Deck';
import { deleteCard } from './cardService';

describe('deleteCard', () => {
	setupDBConnectionForTesting();

	it('decrements the deck card count', async () => {
		const { user, deck } = await seed();
		await Course.updateOne({ _id: deck.courseId }, { userId: user._id });
		const cards = await Card.find({ deckId: deck._id });
		await Deck.updateOne({ _id: deck._id }, { cardCount: cards.length });

		await deleteCard(cards[0]._id.toString(), user._id.toString());

		const updated = await Deck.findById(deck._id);
		expect(updated!.cardCount).to.equal(cards.length - 1);
		expect(await Card.countDocuments({ deckId: deck._id })).to.equal(cards.length - 1);
	});
});
