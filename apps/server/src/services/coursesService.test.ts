import { expect } from 'chai';
import { setupDBConnectionForTesting } from '../config/test-setup';
import Course from '../models/Course';
import { createCourse, getCourses, getDecksForCourse } from './coursesService';
import { createDeck } from './deckService';
import { seed } from '../config/test-seed';
import { User } from 'MemoryFlashCore/src/types/User';

describe('Course and Deck creation', () => {
	setupDBConnectionForTesting();

	it('should create a course', async () => {
		const { course } = await createCourse('My Course');
		expect(course).to.have.property('_id');
		expect(course).to.have.property('name', 'My Course');
		expect(course.decks.length).to.equal(0);
		const dbCourse = await Course.findById(course._id);
		expect(dbCourse).to.not.be.null;
	});
});

describe('System and user content retrieval', () => {
	setupDBConnectionForTesting();

	it('returns system and user courses', async () => {
		const { user } = await seed();
		await createCourse('User Course', user._id.toString());

		const { courses } = await getCourses(user.toJSON() as User);

		expect(courses.length).to.equal(2);
		const systemCount = courses.filter((c) => !c.userId).length;
		const userCount = courses.filter(
			(c) => c.userId?.toString() === user._id.toString(),
		).length;
		expect(systemCount).to.equal(1);
		expect(userCount).to.equal(1);
	});

	it('returns system and user decks', async () => {
		const { user, deck } = await seed();
		const course = await Course.findById(deck.courseId);
		course!.decks.push(deck._id);
		await course!.save();
		await createDeck(course!._id.toString(), 'User Deck', user._id.toString());

		const { decks } = await getDecksForCourse(course!._id.toString(), user.toJSON() as User);

		expect(decks.length).to.equal(2);
		const systemDecks = decks.filter((d) => !d.userId).length;
		const userDecks = decks.filter((d) => d.userId?.toString() === user._id.toString()).length;
		expect(systemDecks).to.equal(1);
		expect(userDecks).to.equal(1);
	});
});
