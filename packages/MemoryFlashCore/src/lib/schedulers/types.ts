import { z } from 'zod';
import { CardWithAttempts } from '../../types/CardWithAttempts';

export const SCHEDULER_IDS = ['speed', 'recall'] as const;
export type SchedulerId = (typeof SCHEDULER_IDS)[number];

export const SCHEDULER_CHOICES = ['auto', ...SCHEDULER_IDS] as const;
export type SchedulerChoice = (typeof SCHEDULER_CHOICES)[number];

export type CardReview = { rung: number; due: number };
export type CardReviews = { [cardId: string]: CardReview };

export type ScheduleContext = {
	cards: CardWithAttempts[];
	reviews: CardReviews;
	queued: string[];
	count: number;
	clock: number;
	random: () => number;
};

export type Scheduler = {
	id: SchedulerId;
	label: string;
	description: string;
	discardSlowAttempts: boolean;
	requeueGap: (review: CardReview) => number | undefined;
	pickNext: (ctx: ScheduleContext) => string[];
};

export const CARDS_PER_BATCH = 4;

export const MISS_REPEAT_OPTIONS = [1, 2, 3, 4, 5].map((value) => ({
	value,
	label: value === 1 ? 'once' : `${value} times in a row`,
}));
export const DEFAULT_MISS_REPEATS = 1;

export const zSchedulerSettings = z.object({
	scheduler: z.enum(SCHEDULER_CHOICES).optional(),
	missRepeats: z.number().int().min(1).max(MISS_REPEAT_OPTIONS.length).optional(),
});
export type SchedulerSettings = z.infer<typeof zSchedulerSettings>;
