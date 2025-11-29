import { Deck } from '../models/Deck';
import Course from '../models/Course';
import { CommunityLeaderboard } from '../models/CommunityLeaderboard';

const PAGE_SIZE = 20;
const LEADERBOARD_LIMIT = 20;

export async function searchPublicDecks(query: string, page: number) {
	const skip = (page - 1) * PAGE_SIZE;

	const searchFilter = {
		visibility: 'public',
		...(query && { name: { $regex: query, $options: 'i' } }),
	};

	const [decks, total] = await Promise.all([
		Deck.find(searchFilter).skip(skip).limit(PAGE_SIZE).lean(),
		Deck.countDocuments(searchFilter),
	]);

	const courseIds = [...new Set(decks.map((d) => d.courseId))];
	const courses = await Course.find({ _id: { $in: courseIds } }).lean();
	const courseMap = new Map(courses.map((c) => [c._id.toString(), c]));

	const results = decks.map((deck) => ({
		_id: deck._id,
		name: deck.name,
		course: courseMap.get(deck.courseId.toString())?.name || null,
	}));

	return { decks: results, total, page, totalPages: Math.ceil(total / PAGE_SIZE) };
}

export async function searchPublicCourses(query: string, page: number) {
	const skip = (page - 1) * PAGE_SIZE;

	const searchFilter = {
		visibility: 'public',
		...(query && { name: { $regex: query, $options: 'i' } }),
	};

	const [courses, total] = await Promise.all([
		Course.find(searchFilter).skip(skip).limit(PAGE_SIZE).lean(),
		Course.countDocuments(searchFilter),
	]);

	const allDeckIds = courses.flatMap((c) => c.decks);
	const decks = await Deck.find({ _id: { $in: allDeckIds } }).lean();
	const deckMap = new Map(decks.map((d) => [d._id.toString(), d]));

	const results = courses.map((course) => {
		const totalCards = course.decks.reduce(
			(sum, deckId) => sum + (deckMap.get(deckId.toString())?.cardCount || 0),
			0,
		);
		return {
			_id: course._id,
			name: course.name,
			deckCount: course.decks.length,
			totalCardCount: totalCards,
		};
	});

	return { courses: results, total, page, totalPages: Math.ceil(total / PAGE_SIZE) };
}

export async function getLeaderboard() {
	const leaderboard = await CommunityLeaderboard.findOne();
	if (!leaderboard) return { entries: [] };

	const topEntries = leaderboard.entries.slice(0, LEADERBOARD_LIMIT);
	const deckIds = topEntries.map((e) => e.deckId);

	const decks = await Deck.find({ _id: { $in: deckIds } }).lean();
	const deckMap = new Map(decks.map((d) => [d._id.toString(), d]));

	const courseIds = [...new Set(decks.map((d) => d.courseId))];
	const courses = await Course.find({ _id: { $in: courseIds } }).lean();
	const courseMap = new Map(courses.map((c) => [c._id.toString(), c]));

	const entries = topEntries.flatMap((entry) => {
		const deck = deckMap.get(entry.deckId.toString());
		if (!deck) return [];
		const course = courseMap.get(deck.courseId.toString());
		return {
			deckId: deck._id,
			deckName: deck.name,
			courseName: course?.name || null,
			attemptCount: entry.attemptCount,
		};
	});

	return { entries };
}
