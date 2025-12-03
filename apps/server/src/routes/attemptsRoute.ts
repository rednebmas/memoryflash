import { Router } from 'express';
import { isAuthenticated } from '../middleware';
import Attempt from '../models/Attempt';
import { zAttempt } from 'MemoryFlashCore/src/types/Attempt';
import { User } from 'MemoryFlashCore/src/types/User';
import { getOrCreateUserStats } from '../services/userStatsService';
import { oneDayInMillis } from 'MemoryFlashCore/src/redux/util/dates';

const router = Router();

router.get('/streak', isAuthenticated, async (req, res, next) => {
	try {
		const userId = (req.user as User)._id.toString();
		const stats = await getOrCreateUserStats(userId);
		const streakDays = Math.max(stats.currentStreak, 1);
		const startDate = new Date(Date.now() - streakDays * oneDayInMillis);
		const attempts = await Attempt.find({
			userId,
			attemptedAt: { $gte: startDate },
		})
			.sort({ attemptedAt: -1 })
			.lean();
		res.json(attempts);
	} catch (error) {
		next(error);
	}
});

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
