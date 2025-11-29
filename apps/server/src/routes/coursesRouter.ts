import { Router } from 'express';
import { isAuthenticated } from '../middleware';
import {
	getCourses,
	getDecksForCourse,
	createCourse,
	renameCourse,
	deleteCourse,
	updateCourseVisibility,
	getCoursePreview,
} from '../services/coursesService';
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
		const course = await createCourse(req.body.name, (req.user as User)._id.toString());
		return res.json({ course });
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

router.get('/:id/preview', async (req, res, next) => {
	try {
		const preview = await getCoursePreview(req.params.id);
		if (!preview) return res.status(404).json({ error: 'Not found' });
		return res.json(preview);
	} catch (error) {
		next(error);
	}
});

router.patch('/:id', isAuthenticated, async (req, res, next) => {
	try {
		const course = await renameCourse(
			req.params.id,
			req.body.name,
			(req.user as User)._id.toString(),
		);
		return res.json({ course });
	} catch (error) {
		next(error);
	}
});

router.patch('/:id/visibility', isAuthenticated, async (req, res, next) => {
	try {
		const course = await updateCourseVisibility(
			req.params.id,
			req.body.visibility,
			(req.user as User)._id.toString(),
		);
		if (!course) return res.status(404).json({ error: 'Not found or not authorized' });
		return res.json({ course });
	} catch (error) {
		next(error);
	}
});

router.delete('/:id', isAuthenticated, async (req, res, next) => {
	try {
		await deleteCourse(req.params.id, (req.user as User)._id.toString());
		return res.json({});
	} catch (error) {
		next(error);
	}
});

export { router as coursesRouter };
