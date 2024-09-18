import { Request, Response, NextFunction } from 'express';

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
	// @ts-ignore
	if (req.isAuthenticated()) {
		return next();
	}
	return next(new Error('session expired'));
};
