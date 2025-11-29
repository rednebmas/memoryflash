import CreateObjectId from 'bson-objectid';
import { expect } from 'chai';
import { it } from 'mocha';
import { ObjectId, Types } from 'mongoose';
import { seed } from '../config/test-seed';
import { setupDBConnectionForTesting } from '../config/test-setup';
import { UserDoc } from '../models';
import Attempt, { AttemptDoc } from '../models/Attempt';
import { Card } from '../models/Card';
import { DeckDoc } from '../models/Deck';
import { User } from 'MemoryFlashCore/src/types/User';
import { addCardsToDeck, getDeckForUser, importDeck } from './deckService';
import { StaffEnum } from 'MemoryFlashCore/src/types/Cards';
import Course from '../models/Course';
import { Deck } from '../models/Deck';

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

describe('importDeck', () => {
	let user: UserDoc, deck: DeckDoc;
	setupDBConnectionForTesting();

	beforeEach(async () => {
		const seededData = await seed();
		user = seededData.user;
		deck = seededData.deck;
	});

	it('returns null for private decks', async () => {
		deck.visibility = 'private';
		await deck.save();

		const result = await importDeck(deck._id.toString(), user._id.toString());
		expect(result).to.be.null;
	});

	it('imports a public deck with all cards', async () => {
		deck.visibility = 'public';
		await deck.save();

		const originalCards = await Card.find({ deckId: deck._id });
		const result = await importDeck(deck._id.toString(), user._id.toString());

		expect(result).to.not.be.null;
		expect(result!.deck.name).to.equal(deck.name);
		expect(result!.deck.importedFromDeckId).to.equal(deck._id.toString());
		expect(result!.course.name).to.equal('Imported Decks');

		const importedCards = await Card.find({ deckId: result!.deck._id });
		expect(importedCards.length).to.equal(originalCards.length);
	});

	it('reuses existing Imported Decks course', async () => {
		deck.visibility = 'public';
		await deck.save();

		await importDeck(deck._id.toString(), user._id.toString());
		const secondDeck = await Deck.create({
			uid: 'second-deck',
			name: 'Second Deck',
			courseId: deck.courseId,
			section: 'Test',
			visibility: 'public',
		});
		await importDeck(secondDeck._id.toString(), user._id.toString());

		const importedCourses = await Course.find({ userId: user._id, name: 'Imported Decks' });
		expect(importedCourses.length).to.equal(1);
		expect(importedCourses[0].decks.length).to.equal(2);
	});

	it('imports to a specified course when courseId provided', async () => {
		deck.visibility = 'public';
		await deck.save();

		const targetCourse = await Course.create({
			name: 'My Custom Course',
			decks: [],
			userId: user._id,
		});

		const result = await importDeck(
			deck._id.toString(),
			user._id.toString(),
			targetCourse._id.toString(),
		);

		expect(result).to.not.be.null;
		expect(result!.course._id.toString()).to.equal(targetCourse._id.toString());
		expect(result!.course.name).to.equal('My Custom Course');
	});

	it('returns null when specified courseId does not belong to user', async () => {
		deck.visibility = 'public';
		await deck.save();

		const otherCourse = await Course.create({
			name: 'Other User Course',
			decks: [],
			userId: new Types.ObjectId(),
		});

		const result = await importDeck(
			deck._id.toString(),
			user._id.toString(),
			otherCourse._id.toString(),
		);

		expect(result).to.be.null;
	});
});
