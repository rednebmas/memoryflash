import { Router } from 'express';
import Course from '../models/Course';
import { User } from '../models/User';
import { generatePopCourse } from '../services/card-generators/pop/basic-I-V-vi-IV';
import { Deck } from '../models/Deck';
import { signUp } from '../services/authService';

const router = Router();

router.post('/seed', async (req, res, next) => {
	try {
		// Delete existing test user if it exists to ensure clean state
		await User.deleteOne({ email: 't@example.com' });

		// Create test user
		const user = await signUp('Test', 'User', 't@example.com', 'Testing123!');

		await generatePopCourse();
		const course = await Course.findOne({ name: 'Pop' });
		const decks = course ? await Deck.find({ _id: { $in: course.decks } }) : [];
		res.json({ course, decks, user });
	} catch (error) {
		next(error);
	}
});

export { router as testRouter };
