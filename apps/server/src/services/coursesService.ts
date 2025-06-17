import Course from '../models/Course';
import { Deck } from '../models/Deck';
import { UserDeckStats } from '../models/UserDeckStats';
import { User } from 'MemoryFlashCore/src/types/User';
import { deleteDeckById } from './deckService';

export async function createCourse(name: string, userId?: string) {
	const course = new Course({ name, decks: [], userId });
	await course.save();
	return course;
}

export async function getCourses(user: User) {
	return {
		courses: await Course.find({
			$or: [{ userId: user._id }, { userId: { $exists: false } }],
		}),
	};
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

export async function renameCourse(courseId: string, name: string, userId: string) {
	return Course.findOneAndUpdate({ _id: courseId, userId }, { name }, { new: true });
}

export async function deleteCourse(courseId: string, userId: string) {
	const course = await Course.findOneAndDelete({ _id: courseId, userId });
	if (!course) return;
	for (const deckId of course.decks) {
		await deleteDeckById(deckId.toString(), userId);
	}
}
