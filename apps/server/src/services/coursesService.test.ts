import { expect } from 'chai';
import { setupDBConnectionForTesting } from '../config/test-setup';
import Course from '../models/Course';
import { createCourse } from './coursesService';
import { createDeck } from './deckService';

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
