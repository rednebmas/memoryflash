import { Router } from 'express';
import { isAuthenticated } from '../middleware';
import { updateCard } from '../services/cardService';
import { User } from 'MemoryFlashCore/src/types/User';

const router = Router();

router.patch('/:id', isAuthenticated, async (req, res, next) => {
	try {
		const card = await updateCard(
			req.params.id,
			req.body.question,
			(req.user as User)._id.toString(),
		);
		return res.json({ card });
	} catch (error) {
		next(error);
	}
});

export { router as cardsRouter };
