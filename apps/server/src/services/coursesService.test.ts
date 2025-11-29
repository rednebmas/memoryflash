import { expect } from 'chai';
import { setupDBConnectionForTesting } from '../config/test-setup';
import { createCourse, getCourses, importCourse } from './coursesService';
import { User } from '../models';
import Course from '../models/Course';
import { Deck } from '../models/Deck';
import { Card } from '../models/Card';

describe('coursesService', () => {
	setupDBConnectionForTesting();

	it('returns system and user courses for a user', async () => {
		const user = await new User({
			firstName: 'Jane',
			lastName: 'Doe',
			email: 'jane@test.com',
			passwordHash: 'hash',
		}).save();

		await createCourse('System');
		await createCourse('User', user._id.toString());

		const { courses } = await getCourses(user.toJSON() as any);
		const names = courses.map((c) => c.name);
		expect(names).to.include('System');
		expect(names).to.include('User');
		const userCourse = courses.find((c) => c.name === 'User');
		expect(userCourse?.userId?.toString()).to.equal(user._id.toString());
	});
});

describe('importCourse', () => {
	setupDBConnectionForTesting();

	it('returns null for private courses', async () => {
		const user = await new User({
			firstName: 'Test',
			lastName: 'User',
			email: 'test@test.com',
			passwordHash: 'hash',
		}).save();

		const course = await Course.create({
			name: 'Private Course',
			decks: [],
			visibility: 'private',
		});

		const result = await importCourse(course._id.toString(), user._id.toString());
		expect(result).to.be.null;
	});

	it('imports a public course with all decks and cards', async () => {
		const user = await new User({
			firstName: 'Test',
			lastName: 'User',
			email: 'test@test.com',
			passwordHash: 'hash',
		}).save();

		const sourceCourse = await Course.create({
			name: 'Public Course',
			decks: [],
			visibility: 'public',
		});

		const deck1 = await Deck.create({
			uid: 'deck-1',
			name: 'Deck 1',
			courseId: sourceCourse._id,
			section: 'Section 1',
			cardCount: 2,
		});

		const deck2 = await Deck.create({
			uid: 'deck-2',
			name: 'Deck 2',
			courseId: sourceCourse._id,
			section: 'Section 2',
			cardCount: 1,
		});

		sourceCourse.decks = [deck1._id, deck2._id];
		await sourceCourse.save();

		await Card.insertMany([
			{
				uid: 'card-1',
				deckId: deck1._id,
				type: 'MultiSheet',
				question: { key: 'C', voices: [] },
				answer: { type: 'ExactMulti' },
			},
			{
				uid: 'card-2',
				deckId: deck1._id,
				type: 'MultiSheet',
				question: { key: 'C', voices: [] },
				answer: { type: 'ExactMulti' },
			},
			{
				uid: 'card-3',
				deckId: deck2._id,
				type: 'MultiSheet',
				question: { key: 'C', voices: [] },
				answer: { type: 'ExactMulti' },
			},
		]);

		const result = await importCourse(sourceCourse._id.toString(), user._id.toString());

		expect(result).to.not.be.null;
		expect(result!.course.name).to.equal('Public Course');
		expect(result!.course.importedFromCourseId).to.equal(sourceCourse._id.toString());
		expect(result!.deckCount).to.equal(2);

		const importedDecks = await Deck.find({ courseId: result!.course._id });
		expect(importedDecks.length).to.equal(2);
		expect(importedDecks[0].importedFromDeckId).to.exist;

		const importedCards = await Card.find({
			deckId: { $in: importedDecks.map((d) => d._id) },
		});
		expect(importedCards.length).to.equal(3);
	});
});
