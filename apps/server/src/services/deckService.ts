import Attempt, { AttemptDoc } from '../models/Attempt';
import { Card } from '../models/Card';
import Course from '../models/Course';
import { Deck } from '../models/Deck';
import { UserDeckStats } from '../models/UserDeckStats';
import { User } from 'MemoryFlashCore/src/types/User';
import { MultiSheetQuestion } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { CardTypeEnum, AnswerType } from 'MemoryFlashCore/src/types/Cards';
import { Types } from 'mongoose';

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

export async function createDeck(courseId: string, name: string) {
	const deck = new Deck({
		uid: `${name}-${Date.now()}`,
		courseId,
		name,
		section: 'Custom',
		sectionSubtitle: '',
		tags: [],
	});
	await deck.save();
	await Course.updateOne({ _id: courseId }, { $push: { decks: deck._id } });
	return deck;
}

export async function addCardsToDeck(deckId: string, questions: MultiSheetQuestion[]) {
	const now = Date.now();
	const cards = questions.map((q, i) => ({
		uid: `custom-${deckId}-${now}-${i}`,
		deckId: new Types.ObjectId(deckId),
		type: CardTypeEnum.MultiSheet,
		question: q,
		answer: { type: AnswerType.ExactMulti },
	}));
	await Card.insertMany(cards);
	return cards;
}
