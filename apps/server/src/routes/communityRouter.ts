import { Router } from 'express';
import { Deck } from '../models/Deck';
import Course from '../models/Course';

const router = Router();

router.get('/decks', async (req, res, next) => {
	try {
		const query = (req.query.q as string) || '';
		const page = parseInt(req.query.page as string) || 1;
		const limit = 20;
		const skip = (page - 1) * limit;

		const searchFilter = {
			visibility: 'public',
			...(query && { name: { $regex: query, $options: 'i' } }),
		};

		const [decks, total] = await Promise.all([
			Deck.find(searchFilter).skip(skip).limit(limit).lean(),
			Deck.countDocuments(searchFilter),
		]);

		const courseIds = [...new Set(decks.map((d) => d.courseId))];
		const courses = await Course.find({ _id: { $in: courseIds } }).lean();
		const courseMap = new Map(courses.map((c) => [c._id.toString(), c]));

		const results = decks.map((deck) => ({
			_id: deck._id,
			name: deck.name,
			course: courseMap.get(deck.courseId.toString())?.name || null,
		}));

		return res.json({ decks: results, total, page, totalPages: Math.ceil(total / limit) });
	} catch (error) {
		next(error);
	}
});

export { router as communityRouter };
