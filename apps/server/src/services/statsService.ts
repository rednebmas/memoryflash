import Attempt, { AttemptDoc } from '../models/Attempt';
import { Card } from '../models/Card';
import { UserDeckStats } from '../models/UserDeckStats';
import { calculateMedian } from 'MemoryFlashCore/src/lib/median';
import { roundToTenth } from 'MemoryFlashCore/src/lib/rounding';
import { StatsByCardId } from 'MemoryFlashCore/src/types/StatsByCardType';
import { User } from 'MemoryFlashCore/src/types/User';
import { MedianHistory, MedianHistoryValue } from 'MemoryFlashCore/src/types/UserDeckStats';

export async function getDeckStats(deckId: string, user: User, timezone: string) {
	const [cards, userDeckStats, attempts] = await Promise.all([
		Card.find({ deckId }),
		UserDeckStats.findOne({ userId: user._id, deckId }),
		Attempt.find({ userId: user._id, deckId }),
	]);

	const statsByCardId: StatsByCardId = {};
	attempts.forEach((attempt) => {
		const cardId = attempt.cardId.toString();
		if (!statsByCardId[cardId]) {
			statsByCardId[cardId] = { attempts: 0, timeStudyingPerDay: {} };
		}

		statsByCardId[cardId]['attempts'] = statsByCardId[cardId]['attempts'] + 1;

		const dateString = attempt.attemptedAt.toLocaleDateString('en-US', { timeZone: timezone });
		const totalTime = statsByCardId[cardId]['timeStudyingPerDay'][dateString] ?? 0;
		statsByCardId[cardId]['timeStudyingPerDay'][dateString] = totalTime + attempt.timeTaken;
	});

	console.log('userDeckStats', userDeckStats);

	return {
		numCards: cards.length,
		statsByCardId,
		stats: userDeckStats,
	};
}

export async function processAttempt(doc: AttemptDoc) {
	if (!doc.correct) {
		return;
	}
	try {
		const userDeckStats = await UserDeckStats.findOne({
			userId: doc.userId,
			deckId: doc.deckId,
		});

		if (userDeckStats) {
			const attempts = { ...userDeckStats.attempts };
			attempts[doc.cardId.toString()] = doc.timeTaken;
			const timeTakenArray = Object.values(attempts);
			const median = roundToTenth(calculateMedian(timeTakenArray));

			const update: any = {
				$set: {
					[`attempts.${doc.cardId.toString()}`]: doc.timeTaken,
					medianTimeTaken: median, // Update the median in the document
				},
			};

			if (median !== userDeckStats.medianTimeTaken) {
				let medianHistory: MedianHistoryValue = { median, date: doc.attemptedAt };
				update.$push = { medianHistory };
			}

			await UserDeckStats.findOneAndUpdate({ _id: userDeckStats._id }, update);
		} else {
			let medianHistory: MedianHistory = [{ median: doc.timeTaken, date: doc.attemptedAt }];
			const newUserDeckStats = new UserDeckStats({
				userId: doc.userId,
				deckId: doc.deckId,
				attempts: { [doc.cardId.toString()]: doc.timeTaken },
				medianTimeTaken: roundToTenth(doc.timeTaken),
				medianHistory,
			});
			await newUserDeckStats.save();
		}
	} catch (error) {
		console.error('Error updating median:', error);
	}
}
