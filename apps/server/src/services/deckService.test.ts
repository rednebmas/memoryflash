import CreateObjectId from 'bson-objectid';
import { expect } from 'chai';
import { it } from 'mocha';
import { ObjectId } from 'mongoose';
import { seed } from '../config/test-seed';
import { setupDBConnectionForTesting } from '../config/test-setup';
import { UserDoc } from '../models';
import Attempt, { AttemptDoc } from '../models/Attempt';
import { Card } from '../models/Card';
import { DeckDoc } from '../models/Deck';
import { User } from 'MemoryFlashCore/src/types/User';
import { addCardsToDeck, getDeckForUser } from './deckService';
import { StaffEnum } from 'MemoryFlashCore/src/types/Cards';

describe('getDeckForUser', () => {
	let user: UserDoc,
		deck: DeckDoc,
		card1,
		card2,
		newestAttempt: AttemptDoc,
		incorrectAttempt: AttemptDoc,
		oneDayOldAttempt: AttemptDoc,
		differentCardAttempt: AttemptDoc;
	setupDBConnectionForTesting();

	beforeEach(async () => {
		const seededData = await seed();
		user = seededData.user;
		deck = seededData.deck;

		const cards = await Card.find({ deckId: deck._id });
		card1 = cards[0];
		card2 = cards[1];

		newestAttempt = new Attempt({
			userId: user._id,
			cardId: card1!._id,
			deckId: deck._id,
			batchId: new CreateObjectId().toHexString(),
			correct: true,
			timeTaken: 20, // arbitrary time
			attemptedAt: new Date(Date.now()), // current time
		});
		await newestAttempt.save();

		incorrectAttempt = new Attempt({
			userId: user._id,
			cardId: card1!._id,
			deckId: deck._id,
			batchId: new CreateObjectId().toHexString(),
			correct: false,
			timeTaken: 25, // arbitrary time
			attemptedAt: new Date(Date.now() - 10000), // 10 seconds earlier
		});
		await incorrectAttempt.save();

		oneDayOldAttempt = new Attempt({
			userId: user._id,
			cardId: card1!._id,
			deckId: deck._id,
			batchId: new CreateObjectId().toHexString(),
			correct: true,
			timeTaken: 30, // arbitrary time
			attemptedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
		});
		await oneDayOldAttempt.save();

		differentCardAttempt = new Attempt({
			userId: user._id,
			cardId: card2!._id,
			deckId: deck._id,
			batchId: new CreateObjectId().toHexString(),
			correct: true,
			timeTaken: 10, // arbitrary time
			// attemptedAt: new Date(Date.now() - 10000), // 10 seconds earlier
			attemptedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
		});
		await differentCardAttempt.save();
	});

	it('should return the deck, cards, and attempts', async () => {
		expect(await Attempt.countDocuments()).to.equal(4);

		const result = await getDeckForUser(deck.id, user.toJSON() as User);

		expect(result.attempts).to.be.an('array').that.is.not.empty;
		expect(result.attempts.length).to.equal(3);

		// Ensure the returned attempt is the newest one
		const returnedAttemptId = result.attempts[0]._id.toString();
		expect(returnedAttemptId).to.equal(newestAttempt._id.toString());

		// Ensure the returned attempt is only for the specified user
		const returnedUserId = result.attempts[0].userId.toString();
		expect(returnedUserId).to.equal((user._id as ObjectId).toString());
	});
});

describe('addCardsToDeck', () => {
	let user: UserDoc, deck: DeckDoc;
	setupDBConnectionForTesting();

	beforeEach(async () => {
		const seededData = await seed();
		user = seededData.user;
		deck = seededData.deck;
	});

	it('assigns the creating user as the userId on the card', async () => {
		const cards = await addCardsToDeck(
			deck._id.toString(),
			[
				{
					key: 'C',
					voices: [
						{
							staff: StaffEnum.Treble,
							stack: [
								{
									duration: 'q',
									notes: [
										{
											name: 'C',
											octave: 4,
										},
									],
								},
							],
						},
					],
				},
			],
			user._id.toString(),
		);

		expect(cards[0].userId?.toString()).to.equal(user._id.toString());

		const persistedCard = await Card.findById(cards[0]._id);
		expect(persistedCard?.userId?.toString()).to.equal(user._id.toString());
	});
});
