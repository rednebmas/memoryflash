import Attempt, { AttemptDoc } from '../models/Attempt';
import { Card } from '../models/Card';
import Course from '../models/Course';
import { Deck } from '../models/Deck';
import { UserDeckStats } from '../models/UserDeckStats';
import { User } from 'MemoryFlashCore/src/types/User';
import { MultiSheetQuestion } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { CardTypeEnum, AnswerType } from 'MemoryFlashCore/src/types/Cards';
import { Types } from 'mongoose';
import { Visibility, VISIBILITIES, VISIBILITY_LEVEL } from 'MemoryFlashCore/src/types/Deck';

export async function isDeckShareable(deckId: string): Promise<boolean> {
	const deck = await Deck.findById(deckId);
	if (!deck) return false;
	const course = await Course.findById(deck.courseId);
	const courseVis = course?.visibility ?? 'private';
	const deckVis = deck.visibility ?? courseVis;
	const effectiveVisibility = Math.min(VISIBILITY_LEVEL[deckVis], VISIBILITY_LEVEL[courseVis]);
	return effectiveVisibility >= VISIBILITY_LEVEL['unlisted'];
}

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

export async function renameDeck(deckId: string, name: string, userId: string) {
	const deck = await Deck.findById(deckId);
	if (!deck) return null;
	const course = await Course.findById(deck.courseId);
	if (course?.userId?.toString() !== userId) return null;
	deck.name = name;
	await deck.save();
	return deck;
}

export async function deleteDeckById(deckId: string, userId: string) {
	const deck = await Deck.findById(deckId);
	if (!deck) return;
	const course = await Course.findById(deck.courseId);
	if (course?.userId?.toString() !== userId) return;
	await Deck.deleteOne({ _id: deckId });

	await Course.updateOne({ _id: deck.courseId }, { $pull: { decks: deck._id } });

	const cards = await Card.find({ deckId: deck._id });
	const cardIds = cards.map((c) => c._id);

	await Promise.all([
		Card.deleteMany({ deckId: deck._id }),
		Attempt.deleteMany({ cardId: { $in: cardIds } }),
		UserDeckStats.deleteMany({ deckId: deck._id }),
	]);
}

export async function addCardsToDeck(
	deckId: string,
	questions: MultiSheetQuestion[],
	userId?: string,
) {
	const now = Date.now();
	const cards = questions.map((q, i) => ({
		uid: `custom-${deckId}-${now}-${i}`,
		deckId: new Types.ObjectId(deckId),
		type: CardTypeEnum.MultiSheet,
		question: q,
		answer: { type: AnswerType.ExactMulti },
		...(userId ? { userId: new Types.ObjectId(userId) } : {}),
	}));
	const insertedCards = await Card.insertMany(cards);
	await Deck.updateOne({ _id: deckId }, { $inc: { cardCount: cards.length } });
	return insertedCards;
}

export async function updateHiddenCards(deckId: string, userId: string, hiddenCardIds: string[]) {
	let stats = await UserDeckStats.findOne({ userId, deckId });
	if (!stats) {
		stats = new UserDeckStats({
			userId,
			deckId,
			attempts: {},
			medianTimeTaken: 0,
			medianHistory: [],
			hiddenCardIds,
		});
		await stats.save();
	} else {
		stats.hiddenCardIds = hiddenCardIds;
		await stats.save();
	}
	return stats;
}

export async function updateDeckVisibility(deckId: string, visibility: Visibility, userId: string) {
	if (!VISIBILITIES.includes(visibility)) return null;
	const deck = await Deck.findById(deckId);
	if (!deck) return null;
	const course = await Course.findById(deck.courseId);
	if (course?.userId?.toString() !== userId) return null;
	const courseVisibility = course?.visibility ?? 'private';
	if (VISIBILITY_LEVEL[visibility] < VISIBILITY_LEVEL[courseVisibility]) return null;
	deck.visibility = visibility;
	await deck.save();
	return deck;
}

export async function getDeckPreview(deckId: string) {
	const deck = await Deck.findById(deckId);
	if (!deck) return null;

	const [course, cards] = await Promise.all([
		Course.findById(deck.courseId),
		Card.find({ deckId }).select('_id question answer type'),
	]);

	const deckVis = deck.visibility ?? 'private';
	const courseVis = course?.visibility ?? 'private';
	const effectiveVisibility = Math.max(VISIBILITY_LEVEL[deckVis], VISIBILITY_LEVEL[courseVis]);
	if (effectiveVisibility < VISIBILITY_LEVEL['unlisted']) return null;

	return {
		deck: {
			_id: deck._id,
			name: deck.name,
			visibility: deck.visibility,
			cardCount: deck.cardCount || 0,
		},
		course: course ? { _id: course._id, name: course.name } : null,
		cards: cards.map((c) => ({
			_id: c._id,
			question: c.question,
			answer: c.answer,
			cardType: c.type,
		})),
	};
}

const IMPORTED_DECKS_COURSE_NAME = 'Imported Decks';

async function getOrCreateImportedDecksCourse(userId: string) {
	let course = await Course.findOne({ userId, name: IMPORTED_DECKS_COURSE_NAME });
	if (!course) {
		course = new Course({ name: IMPORTED_DECKS_COURSE_NAME, decks: [], userId });
		await course.save();
	}
	return course;
}

export async function copyDeckToCoure(
	sourceDeckId: string,
	targetCourseId: string,
	userId: string,
) {
	const sourceDeck = await Deck.findById(sourceDeckId);
	if (!sourceDeck) return null;

	const sourceCards = await Card.find({ deckId: sourceDeck._id }).lean();
	const now = Date.now();

	const newDeck = new Deck({
		uid: `imported-${sourceDeckId}-${now}`,
		courseId: targetCourseId,
		name: sourceDeck.name,
		section: sourceDeck.section,
		sectionSubtitle: sourceDeck.sectionSubtitle,
		tags: [...sourceDeck.tags],
		cardCount: sourceCards.length,
		visibility: 'private',
		importedFromDeckId: sourceDeckId,
	});
	await newDeck.save();

	if (sourceCards.length > 0) {
		const newCards = sourceCards.map((card, i) => ({
			uid: `imported-${newDeck._id}-${now}-${i}`,
			deckId: newDeck._id,
			userId: new Types.ObjectId(userId),
			type: card.type,
			question: card.question,
			answer: card.answer,
		}));
		await Card.insertMany(newCards);
	}

	return newDeck;
}

export async function importDeck(deckId: string, userId: string, targetCourseId?: string) {
	const shareable = await isDeckShareable(deckId);
	if (!shareable) return null;

	let targetCourse;
	if (targetCourseId) {
		targetCourse = await Course.findOne({ _id: targetCourseId, userId });
		if (!targetCourse) return null;
	} else {
		targetCourse = await getOrCreateImportedDecksCourse(userId);
	}

	const newDeck = await copyDeckToCoure(deckId, targetCourse._id.toString(), userId);
	if (!newDeck) return null;

	targetCourse.decks.push(newDeck._id);
	await targetCourse.save();

	return { deck: newDeck, course: targetCourse };
}
