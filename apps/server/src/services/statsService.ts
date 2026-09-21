import Attempt, { AttemptDoc } from '../models/Attempt';
import { Card } from '../models/Card';
import { UserDeckStats } from '../models/UserDeckStats';
import { calculateMedian } from 'MemoryFlashCore/src/lib/median';
import { roundToTenth } from 'MemoryFlashCore/src/lib/rounding';
import { StatsByCardId } from 'MemoryFlashCore/src/types/StatsByCardType';
import { User } from 'MemoryFlashCore/src/types/User';
import { MedianHistoryValue } from 'MemoryFlashCore/src/types/UserDeckStats';
import { nextReview } from 'MemoryFlashCore/src/lib/schedulers/nextReview';
import { updateFeedWithAttempt } from './feedService';

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
	const attemptedAt = doc.attemptedAt ?? new Date();
	doc.attemptedAt = attemptedAt;

	try {
		await updateFeedWithAttempt({
			userId: doc.userId,
			deckId: doc.deckId,
			attemptedAt,
		});
	} catch (error) {
		console.error('Failed to update feed for attempt', error);
	}

	try {
		await updateReview(doc);
		if (doc.correct) await updateMedian(doc, attemptedAt);
	} catch (error) {
		console.error('Error updating deck stats:', error);
	}
}

const UPSERT = { new: true, upsert: true, setDefaultsOnInsert: true };

type StatsFields = { [path: string]: string | string[] };

export const setUserDeckStats = (deckId: string, userId: string, fields: StatsFields) =>
	UserDeckStats.findOneAndUpdate({ userId, deckId }, { $set: fields }, UPSERT);

async function updateReview(doc: AttemptDoc) {
	if (doc.scheduler !== 'recall') return;
	const filter = { userId: doc.userId, deckId: doc.deckId };
	const cardId = doc.cardId.toString();
	const stats = await UserDeckStats.findOne(filter);
	const review = nextReview(stats?.reviews?.[cardId], doc.correct, stats?.recallClock ?? 0);
	await UserDeckStats.findOneAndUpdate(
		filter,
		{ $set: { [`reviews.${cardId}`]: review }, $inc: { recallClock: 1 } },
		UPSERT,
	);
}

async function updateMedian(doc: AttemptDoc, attemptedAt: Date) {
	const filter = { userId: doc.userId, deckId: doc.deckId };
	const cardId = doc.cardId.toString();
	const stats = await UserDeckStats.findOne(filter);
	const attempts = { ...stats?.attempts, [cardId]: doc.timeTaken };
	const median = roundToTenth(calculateMedian(Object.values(attempts)));
	const medianHistory: MedianHistoryValue = { median, date: attemptedAt };
	await UserDeckStats.findOneAndUpdate(
		filter,
		{
			$set: { [`attempts.${cardId}`]: doc.timeTaken, medianTimeTaken: median },
			...(median !== stats?.medianTimeTaken ? { $push: { medianHistory } } : {}),
		},
		UPSERT,
	);
}
