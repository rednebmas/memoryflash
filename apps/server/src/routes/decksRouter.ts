import { Router } from 'express';
import { isAuthenticated } from '../middleware';
import {
	getDeckForUser,
	createDeck,
	addCardsToDeck,
	renameDeck,
	deleteDeckById,
	updateHiddenCards,
	updateDeckVisibility,
	getDeckPreview,
} from '../services/deckService';
import { User } from 'MemoryFlashCore/src/types/User';
import { getDeckStats } from '../services/statsService';

const router = Router();

router.post('/', isAuthenticated, async (req, res, next) => {
	try {
		const { courseId, name } = req.body;
		const deck = await createDeck(courseId, name);
		return res.json({ deck });
	} catch (error) {
		next(error);
	}
});

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

router.get('/:id/preview', async (req, res, next) => {
	try {
		const preview = await getDeckPreview(req.params.id);
		if (!preview) return res.status(404).json({ error: 'Not found' });
		return res.json(preview);
	} catch (error) {
		next(error);
	}
});

router.post('/:id/cards', isAuthenticated, async (req, res, next) => {
	try {
		const { questions } = req.body;
		const cards = await addCardsToDeck(
			req.params.id,
			questions,
			(req.user as User)._id.toString(),
		);
		return res.json({ cards });
	} catch (error) {
		next(error);
	}
});

router.patch('/:id', isAuthenticated, async (req, res, next) => {
	try {
		const deck = await renameDeck(
			req.params.id,
			req.body.name,
			(req.user as User)._id.toString(),
		);
		return res.json({ deck });
	} catch (error) {
		next(error);
	}
});

router.patch('/:id/hidden-cards', isAuthenticated, async (req, res, next) => {
	try {
		const stats = await updateHiddenCards(
			req.params.id,
			(req.user as User)._id.toString(),
			req.body.hiddenCardIds || [],
		);
		return res.json({ stats });
	} catch (error) {
		next(error);
	}
});

router.patch('/:id/visibility', isAuthenticated, async (req, res, next) => {
	try {
		const deck = await updateDeckVisibility(
			req.params.id,
			req.body.visibility,
			(req.user as User)._id.toString(),
		);
		if (!deck) return res.status(404).json({ error: 'Not found or not authorized' });
		return res.json({ deck });
	} catch (error) {
		next(error);
	}
});

router.delete('/:id', isAuthenticated, async (req, res, next) => {
	try {
		await deleteDeckById(req.params.id, (req.user as User)._id.toString());
		return res.json({});
	} catch (error) {
		next(error);
	}
});

export { router as decksRouter };
