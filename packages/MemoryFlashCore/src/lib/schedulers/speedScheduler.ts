import { CardWithAttempts } from '../../types/CardWithAttempts';
import { calculateMedian } from '../median';
import { shuffleArray } from '../shuffleArray';
import { CARDS_PER_BATCH, Scheduler, ScheduleContext } from './types';

const MAX_TRIES = CARDS_PER_BATCH * 5;

type Bucket = {
	weight: number;
	cards: CardWithAttempts[];
	take: () => CardWithAttempts | undefined;
};

const lastTime = (card: CardWithAttempts) => card.attempts[0].timeTaken;

const takeSlowest = (cards: CardWithAttempts[], median: number, random: () => number) => () => {
	const weights = cards.map((card) => lastTime(card) - median);
	const target = random() * weights.reduce((acc, weight) => acc + weight, 0);
	let sum = 0;
	for (let i = 0; i < cards.length; i++) {
		sum += weights[i];
		if (sum >= target) return cards.splice(i, 1)[0];
	}
};

const buildBuckets = ({ cards: all, queued, random }: ScheduleContext): Bucket[] => {
	const cards = all.filter((card) => !queued.includes(card._id));
	const unseen = cards.filter((card) => card.attempts.length === 0);
	const seen = cards.filter((card) => card.attempts.length > 0);
	const median = calculateMedian(seen.map(lastTime));
	const fast = shuffleArray(
		seen.filter((card) => lastTime(card) < median),
		random,
	);
	const slow = shuffleArray(
		seen.filter((card) => lastTime(card) >= median),
		random,
	);
	return [
		{ weight: 6, cards: unseen, take: () => unseen.shift() },
		{ weight: 1, cards: fast, take: () => fast.shift() },
		{ weight: 6, cards: slow, take: takeSlowest(slow, median, random) },
	];
};

const pickBucket = (buckets: Bucket[], rand: number) => {
	const live = buckets.filter((bucket) => bucket.cards.length > 0);
	const total = live.reduce((acc, bucket) => acc + bucket.weight, 0);
	let cumulative = 0;
	return live.find((bucket) => {
		cumulative += bucket.weight / total;
		return rand < cumulative;
	});
};

const pickNext = (ctx: ScheduleContext): string[] => {
	const buckets = buildBuckets(ctx);
	const scheduled: string[] = [];
	let tries = MAX_TRIES;
	while (scheduled.length < CARDS_PER_BATCH && tries-- > 0) {
		const card = pickBucket(buckets, ctx.random())?.take();
		if (!card) break;
		if (!scheduled.includes(card._id)) scheduled.push(card._id);
	}
	return scheduled;
};

export const speedScheduler: Scheduler = {
	id: 'speed',
	label: 'Speed',
	description: 'Drills new and slow cards until your fingers know them.',
	discardSlowAttempts: true,
	requeueGap: () => undefined,
	pickNext,
};
