import { Router } from 'express';
import { isAuthenticated } from '../middleware';
import Attempt from '../models/Attempt';
import { zAttempt } from 'MemoryFlashCore/src/types/Attempt';

const router = Router();

router.post('/', isAuthenticated, async (req, res, next) => {
	try {
		const result = zAttempt.safeParse(req.body);

		if (!result.success) {
			return res.status(400).json({ errors: result.error.flatten() });
		}

		const attempt = new Attempt(result.data);
		await attempt.save();

		res.json(attempt);
	} catch (error) {
		next(error);
	}
});

export { router as attemptsRouter };
