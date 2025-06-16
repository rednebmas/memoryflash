import { expect } from 'chai';
import { setupDBConnectionForTesting } from '../config/test-setup';
import { createDeck } from './deckService';
import { createCourse } from './coursesService';
import Course from '../models/Course';

describe('createDeck', () => {
	setupDBConnectionForTesting();

	it('adds deck id to course', async () => {
		const course = await createCourse('Test');

		const deck = await createDeck(course._id.toString(), 'Custom');
		const updated = await Course.findById(course._id);

		expect(updated?.decks.map((d) => d.toString())).to.include(deck._id.toString());
	});
});
