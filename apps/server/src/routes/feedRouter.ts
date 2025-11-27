import { Router } from 'express';
import { isAuthenticated } from '../middleware';
import { getFeedForUser } from '../services/feedService';
import { User } from 'MemoryFlashCore/src/types/User';

const router = Router();

router.get('/', isAuthenticated, async (req, res, next) => {
	try {
		const feed = await getFeedForUser(req.user as User);
		return res.json(feed);
	} catch (error) {
		next(error);
	}
});

export { router as feedRouter };
