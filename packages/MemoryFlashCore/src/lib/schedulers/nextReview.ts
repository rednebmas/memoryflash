import { CardReview } from './types';

export const FIRST_INTERVAL_DAYS = 3;
export const LAPSE_INTERVAL_DAYS = 1;
export const STARTING_EASE = 2.5;
export const MIN_EASE = 1.3;
export const LAPSE_EASE_PENALTY = 0.2;

const DAY_MS = 24 * 60 * 60 * 1000;

const review = (interval: number, ease: number, now: Date): CardReview => ({
	interval,
	ease,
	due: new Date(now.getTime() + interval * DAY_MS).toISOString(),
});

export const nextReview = (
	prev: CardReview | undefined,
	correct: boolean,
	now: Date,
): CardReview => {
	if (prev && new Date(prev.due) > now) return prev;
	const ease = prev?.ease ?? STARTING_EASE;
	if (!correct) {
		return review(LAPSE_INTERVAL_DAYS, Math.max(MIN_EASE, ease - LAPSE_EASE_PENALTY), now);
	}
	if (!prev) return review(FIRST_INTERVAL_DAYS, ease, now);
	return review(Math.round(prev.interval * ease), ease, now);
};
