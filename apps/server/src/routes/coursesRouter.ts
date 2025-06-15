import { Router } from 'express';
import { isAuthenticated } from '../middleware';
import { getCourses, getDecksForCourse, createCourse } from '../services/coursesService';
import { User } from 'MemoryFlashCore/src/types/User';

const router = Router();

router.get('/', isAuthenticated, async (req, res, next) => {
	try {
		const { courses } = await getCourses(req.user as User);
		return res.json({
			courses,
		});
	} catch (error) {
		next(error);
	}
});

router.post('/', isAuthenticated, async (req, res, next) => {
	try {
		const { name } = req.body;
		const result = await createCourse(name);
		return res.json(result);
	} catch (error) {
		next(error);
	}
});

router.get('/:id', isAuthenticated, async (req, res, next) => {
	try {
		const { decks, course, userDeckStats } = await getDecksForCourse(
			req.params.id,
			req.user as User,
		);
		return res.json({
			decks,
			course,
			userDeckStats,
		});
	} catch (error) {
		next(error);
	}
});

export { router as coursesRouter };
