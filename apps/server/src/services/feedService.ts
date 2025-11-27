import Course from '../models/Course';
import { Deck } from '../models/Deck';
import { RecentDeckFeedEntryDoc, UserFeed } from '../models/UserFeed';
import { User } from 'MemoryFlashCore/src/types/User';
import { FeedResponse } from 'MemoryFlashCore/src/types/Feed';
import { MongoId } from 'MemoryFlashCore/src/types/helper-types';

const RECENT_DECK_LIMIT = 6;

type AttemptLike = {
	userId: MongoId;
	deckId: MongoId;
	attemptedAt: Date;
};

export async function updateFeedWithAttempt(attempt: AttemptLike) {
	try {
		const deck = await Deck.findById(attempt.deckId);
		if (!deck) {
			return;
		}

		if (!deck.courseId) {
			return;
		}

		const entry: RecentDeckFeedEntryDoc = {
			key: `recentDeck:${deck._id.toString()}`,
			type: 'recentDeck' as const,
			deckId: deck._id.toString(),
			courseId: deck.courseId.toString(),
			lastStudiedAt: attempt.attemptedAt,
		};

		const feed = await UserFeed.findOne({ userId: attempt.userId });
		if (!feed) {
			await UserFeed.create({ userId: attempt.userId, entries: [entry] });
			return;
		}

		const nextEntries = feed.entries.filter((item) => item.key !== entry.key);
		feed.entries = [entry, ...nextEntries].slice(0, RECENT_DECK_LIMIT);
		await feed.save();
	} catch (error) {
		console.error('Failed to update user feed', error);
	}
}

export async function getFeedForUser(user: User): Promise<FeedResponse> {
	const feed = await UserFeed.findOne({ userId: user._id }).lean();
	if (!feed) {
		return { entries: [] };
	}

	const deckIds = Array.from(new Set(feed.entries.map((entry) => entry.deckId)));
	const courseIds = Array.from(new Set(feed.entries.map((entry) => entry.courseId)));
	const [decks, courses] = await Promise.all([
		Deck.find({ _id: { $in: deckIds } }).lean(),
		Course.find({ _id: { $in: courseIds } }).lean(),
	]);

	const deckById = new Map(decks.map((deck) => [deck._id.toString(), deck]));
	const courseById = new Map(courses.map((course) => [course._id.toString(), course]));

	return {
		entries: feed.entries.map((entry) => {
			const deck = deckById.get(entry.deckId);
			const course = courseById.get(entry.courseId);
			return {
				id: entry.key,
				type: 'recentDeck' as const,
				deckId: entry.deckId,
				deckName: deck?.name ?? 'Unknown deck',
				courseId: entry.courseId,
				courseName: course?.name ?? 'Unknown course',
				lastStudiedAt: entry.lastStudiedAt.toISOString(),
			};
		}),
	};
}
