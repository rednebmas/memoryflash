import { expect } from 'chai';
import { setupDBConnectionForTesting } from '../config/test-setup';
import { createCourse, getCourses, importCourse, updateCourseVisibility } from './coursesService';
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

	it('skips private decks when importing a public course', async () => {
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

		const publicDeck = await Deck.create({
			uid: 'public-deck',
			name: 'Public Deck',
			courseId: sourceCourse._id,
			section: 'Section 1',
			cardCount: 1,
			visibility: 'public',
		});

		const privateDeck = await Deck.create({
			uid: 'private-deck',
			name: 'Private Deck',
			courseId: sourceCourse._id,
			section: 'Section 2',
			cardCount: 1,
			visibility: 'private',
		});

		sourceCourse.decks = [publicDeck._id, privateDeck._id];
		await sourceCourse.save();

		await Card.insertMany([
			{
				uid: 'public-card',
				deckId: publicDeck._id,
				type: 'MultiSheet',
				question: { key: 'C', voices: [] },
				answer: { type: 'ExactMulti' },
			},
			{
				uid: 'private-card',
				deckId: privateDeck._id,
				type: 'MultiSheet',
				question: { key: 'C', voices: [] },
				answer: { type: 'ExactMulti' },
			},
		]);

		const result = await importCourse(sourceCourse._id.toString(), user._id.toString());

		expect(result).to.not.be.null;
		expect(result!.deckCount).to.equal(1);

		const importedDecks = await Deck.find({ courseId: result!.course._id });
		expect(importedDecks.length).to.equal(1);
		expect(importedDecks[0].name).to.equal('Public Deck');
	});
});

describe('updateCourseVisibility', () => {
	setupDBConnectionForTesting();

	it('clears deck visibilities when course becomes more public', async () => {
		const user = await new User({
			firstName: 'Test',
			lastName: 'User',
			email: 'test@test.com',
			passwordHash: 'hash',
		}).save();

		const course = await Course.create({
			name: 'Test Course',
			decks: [],
			visibility: 'private',
			userId: user._id.toString(),
		});

		const deck1 = await Deck.create({
			uid: 'deck-1',
			name: 'Deck 1',
			courseId: course._id,
			section: 'Section 1',
			visibility: 'private',
		});

		const deck2 = await Deck.create({
			uid: 'deck-2',
			name: 'Deck 2',
			courseId: course._id,
			section: 'Section 1',
			visibility: 'unlisted',
		});

		course.decks = [deck1._id, deck2._id];
		await course.save();

		await updateCourseVisibility(course._id.toString(), 'public', user._id.toString());

		const updatedDeck1 = await Deck.findById(deck1._id);
		const updatedDeck2 = await Deck.findById(deck2._id);

		expect(updatedDeck1!.visibility).to.be.undefined;
		expect(updatedDeck2!.visibility).to.be.undefined;
	});

	it('does not change deck visibilities when course becomes less restrictive', async () => {
		const user = await new User({
			firstName: 'Test',
			lastName: 'User',
			email: 'test@test.com',
			passwordHash: 'hash',
		}).save();

		const course = await Course.create({
			name: 'Test Course',
			decks: [],
			visibility: 'public',
			userId: user._id.toString(),
		});

		const deck = await Deck.create({
			uid: 'deck-1',
			name: 'Deck 1',
			courseId: course._id,
			section: 'Section 1',
			visibility: 'public',
		});

		course.decks = [deck._id];
		await course.save();

		await updateCourseVisibility(course._id.toString(), 'unlisted', user._id.toString());

		const updatedDeck = await Deck.findById(deck._id);
		expect(updatedDeck!.visibility).to.equal('public');
	});
});
