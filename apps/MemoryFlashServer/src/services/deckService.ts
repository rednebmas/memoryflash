import Attempt, { AttemptDoc } from '../models/Attempt';
import { Card } from '../models/Card';
import Course from '../models/Course';
import { Deck } from '../models/Deck';
import { UserDeckStats } from '../models/UserDeckStats';
import { User } from '../submodules/MemoryFlashCore/src/types/User';

export async function getDeckForUser(deckId: string, user: User) {
	const [deck, cards, userDeckStats] = await Promise.all([
		Deck.findOne({ _id: deckId }),
		Card.find({ deckId }),
		UserDeckStats.findOne({ userId: user._id, deckId }),
	]);

	if (!deck) {
		throw new Error('Deck not found');
	}

	const cardIds = cards.map((card) => card._id); // Extracting card IDs

	const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);

	const [course, recentAttempts, mostRecentCorrectAttempt] = await Promise.all([
		Course.findOne({ _id: deck.courseId }),
		Attempt.find({
			cardId: { $in: cardIds },
			userId: user._id,
			attemptedAt: { $gte: sixHoursAgo },
		}),
		Attempt.aggregate([
			{
				$match: {
					cardId: { $in: cardIds },
					userId: user._id,
					correct: true,
				},
			},
			{ $sort: { attemptedAt: -1 } },
			{
				$group: {
					_id: '$cardId',
					userId: { $first: '$userId' },
					latestAttempt: { $first: '$$ROOT' }, // The document of the latest attempt
				},
			},
			{
				$replaceRoot: { newRoot: '$latestAttempt' }, // Replaces the root with the latestAttempt document
			},
		]),
	]);

	const attempts = deduplicateAttempts([...recentAttempts, ...mostRecentCorrectAttempt]);

	return { deck, cards, attempts, course, userDeckStats };
}

function deduplicateAttempts(attempts: AttemptDoc[]) {
	const uniqueAttempts: AttemptDoc[] = [];

	const seenCardIds = new Set<string>();

	for (const attempt of attempts) {
		if (!seenCardIds.has(attempt._id.toString())) {
			uniqueAttempts.push(attempt);
			seenCardIds.add(attempt._id.toString());
		}
	}

	return uniqueAttempts;
}
