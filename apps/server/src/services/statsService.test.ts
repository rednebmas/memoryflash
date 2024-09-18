import mongoose from 'mongoose';
import { setupDBConnectionForTesting } from '../config/test-setup';
import { UserDeckStats } from '../models/UserDeckStats';
import Attempt from '../models/Attempt';
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

		// Create a correct Attempt
		const attempt = new Attempt({
			userId,
			deckId,
			cardId,
			batchId: 'batch1',
			correct: true,
			timeTaken: 10,
			attemptedAt: new Date(),
		});

		// this calls processAttempt in the pre save hook
		await attempt.save();

		let updatedStats = await UserDeckStats.findOne({ userId, deckId });

		expect(updatedStats!.attempts[cardId.toString()]).to.equal(10);
		expect(updatedStats!.medianTimeTaken).to.equal(10);

		// Create a second correct Attempt for same card
		const attempt2 = new Attempt({
			userId,
			deckId,
			cardId,
			batchId: 'batch1',
			correct: true,
			timeTaken: 9,
			attemptedAt: new Date(),
		});
		await attempt2.save();

		updatedStats = await UserDeckStats.findOne({ userId, deckId });

		expect(updatedStats!.attempts[cardId.toString()]).to.equal(9);
		expect(updatedStats!.medianTimeTaken).to.equal(9);
		expect(updatedStats!.medianHistory.length).to.equal(2);

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
