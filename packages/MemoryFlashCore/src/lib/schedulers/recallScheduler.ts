import { CARDS_PER_BATCH, Scheduler, ScheduleContext } from './types';

const dueTime = (ctx: ScheduleContext, cardId: string) =>
	new Date(ctx.reviews[cardId].due).getTime();

const pickNext = (ctx: ScheduleContext): string[] => {
	const ids = ctx.cards.map((card) => card._id).filter((id) => !ctx.queued.includes(id));
	const due = ids
		.filter((id) => ctx.reviews[id] && dueTime(ctx, id) <= ctx.now)
		.sort((a, b) => dueTime(ctx, a) - dueTime(ctx, b));
	const unseen = ids.filter((id) => !ctx.reviews[id]);
	return [...due, ...unseen].slice(0, CARDS_PER_BATCH);
};

export const recallScheduler: Scheduler = {
	id: 'recall',
	label: 'Recall',
	description: 'Spaced repetition. Cards you know come back after days, not minutes.',
	discardSlowAttempts: false,
	pickNext,
};
