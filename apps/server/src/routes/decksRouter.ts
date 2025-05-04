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
		const { courseId, name, section, sectionSubtitle } = req.body;
		
		if (!courseId || !name) {
			return res.status(400).json({ error: 'Course ID and deck name are required' });
		}
		
		const { deck } = await createDeck(
			courseId,
			name,
			section || 'Custom',
			sectionSubtitle || '',
			req.user as User
		);
		
		return res.status(201).json({ deck });
	} catch (error) {
		next(error);
	}
});

export { router as decksRouter };
