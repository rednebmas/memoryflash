import { Router } from 'express';
import { passport } from '../config';
import { Err, isAuthenticated } from '../middleware';
import { requestPasswordReset, resetPassword, signUp } from '../services';
import { userOnLoadInfo } from '../services/userOnLoadInfo';
import { User } from 'MemoryFlashCore/src/types/User';

const router = Router();

router.post('/sign-up', async (req, res, next) => {
	try {
		const { firstName, lastName, email, password } = req.body;
		const user = await signUp(firstName, lastName, email, password);

		req.logIn(user, (error) => {
			if (error) {
				throw new Err('Error logging in after registration', 500);
			}
			res.status(201).json({ user });
		});
	} catch (error) {
		next(error);
	}
});

router.post('/log-in', passport.authenticate('local'), async (req, res, next) => {
	try {
		let user: User = req.user as User;
		res.json(await userOnLoadInfo(user._id));
	} catch (error) {
		next(error);
	}
});

router.get('/sign-out', isAuthenticated, (req, res, next) => {
	try {
		req.logout((err) => {
			if (err) {
				throw new Err('Error logging out', 400);
			}
			res.status(200).json({ success: true });
		});
	} catch (error) {
		next(error);
	}
});

router.post('/request-password-reset', async (req, res, next) => {
	try {
		const { email } = req.body;
		await requestPasswordReset(email);
		res.status(201).json({ success: true });
	} catch (error) {
		next(error);
	}
});

router.post('/reset-password', async (req, res, next) => {
	try {
		const { token, password } = req.body;
		await resetPassword(token, password);
		res.status(201).json({ success: true });
	} catch (error) {
		next(error);
	}
});

export { router as authRouter };
