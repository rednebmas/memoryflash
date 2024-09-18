import { sleep } from '../utils/sleep';
import { Request, Response, NextFunction } from 'express';

export const devSleep = async (req: Request, res: Response, next: NextFunction) => {
	if (req.query && req.query.delay && typeof req.query.delay === 'string') {
		await sleep(parseInt(req.query.delay));
	} else {
		await sleep(250);
	}
	next();
};
