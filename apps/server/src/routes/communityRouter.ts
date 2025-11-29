import { Router } from 'express';
import { searchPublicDecks, searchPublicCourses } from '../services/communityService';

const router = Router();

router.get('/decks', async (req, res, next) => {
	try {
		const query = (req.query.q as string) || '';
		const page = parseInt(req.query.page as string) || 1;
		return res.json(await searchPublicDecks(query, page));
	} catch (error) {
		next(error);
	}
});

router.get('/courses', async (req, res, next) => {
	try {
		const query = (req.query.q as string) || '';
		const page = parseInt(req.query.page as string) || 1;
		return res.json(await searchPublicCourses(query, page));
	} catch (error) {
		next(error);
	}
});

export { router as communityRouter };
