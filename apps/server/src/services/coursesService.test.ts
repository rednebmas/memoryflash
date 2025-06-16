import { expect } from 'chai';
import { setupDBConnectionForTesting } from '../config/test-setup';
import { createCourse, getCourses } from './coursesService';
import { User } from '../models';

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
