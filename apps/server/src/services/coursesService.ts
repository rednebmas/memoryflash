import Course from '../models/Course';
import { Deck } from '../models/Deck';
import { UserDeckStats } from '../models/UserDeckStats';
import { User } from 'MemoryFlashCore/src/types/User';
import { Types } from 'mongoose';

export async function getCourses(user: User) {
	// Return both system courses (no userId) and the user's own courses
	return {
		courses: await Course.find({
			$or: [
				{ userId: { $exists: false } }, // System courses
				{ userId: user._id }, // User's own courses
			],
		}),
	};
}

export async function getDecksForCourse(courseId: string, user: User) {
	const course = await Course.findById(courseId);
	
	// Check if the course exists
	if (!course) {
		throw new Error('Course not found');
	}
	
	// Check if the course has a userId and if it belongs to the current user
	// When comparing ObjectIds, we need to convert both to strings
	if (course.userId && course.userId.toString() !== user._id.toString()) {
		throw new Error('Access denied to this course');
	}
	
	const [decks, userDeckStats] = await Promise.all([
		Deck.find({ _id: { $in: course.decks } }),
		UserDeckStats.find({ userId: user._id, deckId: { $in: course.decks } }),
	]);
	return {
		decks,
		userDeckStats,
		course,
	};
}

export async function createCourse(name: string, user: User) {
	const course = new Course({
		name,
		userId: user._id,
		decks: [], // Start with an empty array of decks
	});
	
	await course.save();
	
	return {
		course,
	};
}
