import { Router } from 'express';
import { isAuthenticated } from '../middleware';
import { getDeckForUser, createDeck } from '../services/deckService';
import { User } from 'MemoryFlashCore/src/types/User';
import { getDeckStats } from '../services/statsService';

const router = Router();

router.get('/:id', isAuthenticated, async (req, res, next) => {
	try {
		const { course, deck, cards, attempts, userDeckStats } = await getDeckForUser(
			req.params.id,
			req.user as User,
		);
		return res.json({
			course,
			deck,
			cards,
			attempts,
			userDeckStats,
		});
	} catch (error) {
		next(error);
	}
});

router.get('/:id/stats', isAuthenticated, async (req, res, next) => {
	try {
		return res.json(
			await getDeckStats(
				req.params.id,
				req.user as User,
				req.headers['user-time-zone'] as string,
			),
		);
	} catch (error) {
		next(error);
	}
});

router.post('/', isAuthenticated, async (req, res, next) => {
	try {
		const { courseId, name } = req.body;
		const result = await createDeck(courseId, name);
		return res.json(result);
	} catch (error) {
		next(error);
	}
});

export { router as decksRouter };
