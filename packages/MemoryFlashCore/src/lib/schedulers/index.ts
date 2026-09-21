import { recallScheduler } from './recallScheduler';
import { speedScheduler } from './speedScheduler';
import { Scheduler, SchedulerId } from './types';

export const schedulers: Record<SchedulerId, Scheduler> = {
	speed: speedScheduler,
	recall: recallScheduler,
};
