import { Request, Response, Router } from 'express';
import { notFound } from '../middleware';
import { getIPAddress } from '../utils';
import { authRouter } from './authRoute';
import { decksRouter } from './decksRouter';
import { coursesRouter } from './coursesRouter';
import { attemptsRouter } from './attemptsRoute';

const router = Router();

router.get('/', (req: Request, res: Response) => {
	const ip = getIPAddress(req);
	return res.send(`Hello human, you are coming from ${ip}`);
});

router.use('/auth', authRouter);
router.use('/decks', decksRouter);
router.use('/courses', coursesRouter);
router.use('/attempts', attemptsRouter);
router.use(notFound);

export { router as api };
