import { Router } from 'express';
import { isAuthenticated } from '../middleware';
import { fileBugReport } from '../services/bugReportService';
import { User } from 'MemoryFlashCore/src/types/User';

const router = Router();

router.post('/', isAuthenticated, async (req, res, next) => {
	try {
		const report = await fileBugReport(req.user as User, req.body);
		return res.json({ id: report.id });
	} catch (error) {
		next(error);
	}
});

export { router as bugReportRouter };
