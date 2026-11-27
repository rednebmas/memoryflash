import { z } from 'zod';
import { CardWithAttempts } from '../types/CardWithAttempts';

export const zSkippedCards = z.record(z.string(), z.string().datetime());
export type SkippedCards = z.infer<typeof zSkippedCards>;

const sameLocalDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

const studiedSince = (card: CardWithAttempts, since: Date) =>
	card.attempts.some((a) => new Date(a.attemptedAt) > since);

export const activeSkippedCardIds = (
	skipped: SkippedCards | undefined,
	cards: CardWithAttempts[],
	now: Date,
) => {
	const entries = Object.entries(skipped ?? {});
	const unskipped = cards.filter((c) => !skipped?.[c._id]);
	return entries
		.filter(([, at]) => {
			const since = new Date(at);
			return sameLocalDay(since, now) && unskipped.some((c) => !studiedSince(c, since));
		})
		.map(([cardId]) => cardId);
};
