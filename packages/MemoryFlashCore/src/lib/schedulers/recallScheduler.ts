import { gapForRung } from './nextReview';
import { CardReview, Scheduler, ScheduleContext } from './types';

const MAX_INLINE_GAP = 12;

const byDue = (ctx: ScheduleContext) => (a: string, b: string) =>
	ctx.reviews[a].due - ctx.reviews[b].due;

const pickNext = (ctx: ScheduleContext): string[] => {
	const ids = ctx.cards.map((card) => card._id).filter((id) => !ctx.queued.includes(id));
	const seen = ids.filter((id) => typeof ctx.reviews[id]?.rung === 'number').sort(byDue(ctx));
	const ready = seen.filter((id) => ctx.reviews[id].due <= ctx.clock);
	const waiting = seen.filter((id) => ctx.reviews[id].due > ctx.clock);
	const unseen = ids.filter((id) => !seen.includes(id));
	return [...ready, ...unseen, ...waiting].slice(0, ctx.count);
};

const requeueGap = (review: CardReview) => {
	const gap = gapForRung(review.rung);
	return gap <= MAX_INLINE_GAP ? gap : undefined;
};

export const recallScheduler: Scheduler = {
	id: 'recall',
	label: 'Recall',
	description: 'Cards you know come back after more and more other cards. A miss drops a rung.',
	discardSlowAttempts: false,
	requeueOnMiss: false,
	requeueGap,
	pickNext,
};
