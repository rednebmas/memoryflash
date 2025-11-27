import mongoose from 'mongoose';
import { setupDBConnectionForTesting } from '../config/test-setup';
import { UserDeckStats } from '../models/UserDeckStats';
import Attempt from '../models/Attempt';
import Course from '../models/Course';
import { Deck } from '../models/Deck';
import { UserFeed } from '../models/UserFeed';
import { processAttempt } from './statsService';
import { expect } from 'chai';
import { calculateMedian } from 'MemoryFlashCore/src/lib/median';

describe('processAttempt', () => {
	setupDBConnectionForTesting();

	it('should update median time and attempts correctly when processing a correct attempt', async () => {
		// Create and save a user and a deck
		const userId = new mongoose.Types.ObjectId();
		const deckId = new mongoose.Types.ObjectId();
		const cardId = new mongoose.Types.ObjectId();

		const course = await new Course({ name: 'Test Course', decks: [deckId], userId }).save();
		await new Deck({
			_id: deckId,
			uid: 'test-deck',
			name: 'Test Deck',
			courseId: course._id.toString(),
			section: 'Custom',
			sectionSubtitle: '',
			tags: [],
		}).save();

		// Create a correct Attempt
		const firstAttemptedAt = new Date();
		const attempt = new Attempt({
			userId,
			deckId,
			cardId,
			batchId: 'batch1',
			correct: true,
			timeTaken: 10,
			attemptedAt: firstAttemptedAt,
		});

		// this calls processAttempt in the pre save hook
		await attempt.save();

		let feed = await UserFeed.findOne({ userId });
		expect(feed).to.not.be.null;
		expect(feed!.entries.length).to.equal(1);
		expect(feed!.entries[0].deckId).to.equal(deckId.toString());
		expect(feed!.entries[0].lastStudiedAt.getTime()).to.equal(firstAttemptedAt.getTime());

		let updatedStats = await UserDeckStats.findOne({ userId, deckId });

		expect(updatedStats!.attempts[cardId.toString()]).to.equal(10);
		expect(updatedStats!.medianTimeTaken).to.equal(10);

		// Create a second correct Attempt for same card
		const secondAttemptedAt = new Date(firstAttemptedAt.getTime() + 1000);
		const attempt2 = new Attempt({
			userId,
			deckId,
			cardId,
			batchId: 'batch1',
			correct: true,
			timeTaken: 9,
			attemptedAt: secondAttemptedAt,
		});
		await attempt2.save();

		updatedStats = await UserDeckStats.findOne({ userId, deckId });

		expect(updatedStats!.attempts[cardId.toString()]).to.equal(9);
		expect(updatedStats!.medianTimeTaken).to.equal(9);
		expect(updatedStats!.medianHistory.length).to.equal(2);

		feed = await UserFeed.findOne({ userId });
		expect(feed!.entries[0].lastStudiedAt.getTime()).to.equal(secondAttemptedAt.getTime());

		// Create a third Attempt for different card
		const secondCardId = new mongoose.Types.ObjectId();
		const attempt3 = new Attempt({
			userId,
			deckId,
			cardId: secondCardId,
			batchId: 'batch1',
			correct: true,
			timeTaken: 11,
			attemptedAt: new Date(),
		});
		await attempt3.save();

		updatedStats = await UserDeckStats.findOne({ userId, deckId });

		expect(updatedStats!.attempts[cardId.toString()]).to.equal(9);
		expect(updatedStats!.attempts[secondCardId.toString()]).to.equal(11);
		expect(updatedStats!.medianTimeTaken).to.equal(10);
		expect(updatedStats!.medianHistory.length).to.equal(3);

		// Create a fourth Attempt for the same card, shouldn't update median history
		const thirdCardId = new mongoose.Types.ObjectId();
		const attempt4 = new Attempt({
			userId,
			deckId,
			cardId: thirdCardId,
			batchId: 'batch1',
			correct: true,
			timeTaken: 10,
			attemptedAt: new Date(),
		});
		await attempt4.save();

		updatedStats = await UserDeckStats.findOne({ userId, deckId });

		expect(updatedStats!.medianTimeTaken).to.equal(10);
		expect(updatedStats!.medianHistory.length).to.equal(3);
	});
});
