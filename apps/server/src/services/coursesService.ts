import Course from '../models/Course';
import { Deck } from '../models/Deck';
import { UserDeckStats } from '../models/UserDeckStats';
import { User } from 'MemoryFlashCore/src/types/User';

export async function getCourses(user: User) {
	return {
		courses: await Course.find(),
	};
}

export async function createCourse(name: string) {
	const course = new Course({ name, decks: [] });
	await course.save();
	return { course };
}

export async function getDecksForCourse(courseId: string, user: User) {
	const course = await Course.findById(courseId);
	const [decks, userDeckStats] = await Promise.all([
		Deck.find({ _id: { $in: course!.decks } }),
		UserDeckStats.find({ userId: user._id, deckId: { $in: course!.decks } }),
	]);
	return {
		decks,
		userDeckStats,
		course,
	};
}
