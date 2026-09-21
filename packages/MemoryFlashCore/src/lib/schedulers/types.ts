import { CardWithAttempts } from '../../types/CardWithAttempts';

export const SCHEDULER_IDS = ['speed', 'recall'] as const;
export type SchedulerId = (typeof SCHEDULER_IDS)[number];

export const SCHEDULER_CHOICES = ['auto', ...SCHEDULER_IDS] as const;
export type SchedulerChoice = (typeof SCHEDULER_CHOICES)[number];

export type CardReview = { interval: number; ease: number; due: string };
export type CardReviews = { [cardId: string]: CardReview };

export type ScheduleContext = {
	cards: CardWithAttempts[];
	reviews: CardReviews;
	queued: string[];
	now: number;
	random: () => number;
};

export type Scheduler = {
	id: SchedulerId;
	label: string;
	description: string;
	discardSlowAttempts: boolean;
	pickNext: (ctx: ScheduleContext) => string[];
};

export const CARDS_PER_BATCH = 4;
