import Attempt, { AttemptDoc } from '../models/Attempt';
import { Card } from '../models/Card';
import Course from '../models/Course';
import { Deck } from '../models/Deck';
import { UserDeckStats } from '../models/UserDeckStats';
import { User } from 'MemoryFlashCore/src/types/User';

export async function getDeckForUser(deckId: string, user: User) {
	const [deck, cards, userDeckStats] = await Promise.all([
		Deck.findOne({ _id: deckId }),
		Card.find({ deckId }),
		UserDeckStats.findOne({ userId: user._id, deckId }),
	]);

	if (!deck) {
		throw new Error('Deck not found');
	}
	
	// Check if the deck is a custom deck and belongs to the user
	if (deck.userId && deck.userId.toString() !== user._id.toString()) {
		throw new Error('Access denied to this deck');
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

export async function createDeck(
	courseId: string, 
	name: string, 
	section: string, 
	sectionSubtitle: string, 
	user: User
) {
	// Find the course
	const course = await Course.findById(courseId);
	
	if (!course) {
		throw new Error('Course not found');
	}
	
	// Check if the course is a custom course and belongs to the user
	if (course.userId && course.userId.toString() !== user._id.toString()) {
		throw new Error('Access denied to this course');
	}
	
	// Generate a simple UID based on the name and timestamp
	const timestamp = new Date().getTime();
	const uid = `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${timestamp}`;
	
	// Create the new deck
	const deck = new Deck({
		uid,
		name,
		courseId,
		userId: user._id,
		section,
		sectionSubtitle,
		tags: ['custom'],
	});
	
	await deck.save();
	
	// Update the course with the new deck ID
	await Course.findByIdAndUpdate(courseId, {
		$push: { decks: deck._id }
	});
	
	return { deck };
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
