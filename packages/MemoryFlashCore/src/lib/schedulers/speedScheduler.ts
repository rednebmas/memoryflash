import { CardWithAttempts } from '../../types/CardWithAttempts';
import { CardTypeEnum } from '../../types/Cards';
import { calculateMedian } from '../median';
import { shuffleArray } from '../shuffleArray';
import { CARDS_PER_BATCH, Scheduler, ScheduleContext } from './types';

const REPETITIONS = 2;
const MAX_TRIES = CARDS_PER_BATCH * 5;

type Bucket = {
	weight: number;
	repeats: boolean;
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

const buildBuckets = ({ cards, random }: ScheduleContext): Bucket[] => {
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
		{ weight: unseen.length ? 6 : 0, repeats: true, take: () => unseen.shift() },
		{ weight: fast.length ? 1 : 0, repeats: false, take: () => fast.shift() },
		{ weight: slow.length ? 6 : 0, repeats: true, take: takeSlowest(slow, median, random) },
	];
};

const pickBucket = (buckets: Bucket[], totalWeight: number, rand: number) => {
	let cumulative = 0;
	return buckets.find((bucket) => {
		cumulative += bucket.weight / totalWeight;
		return rand < cumulative;
	});
};

const copiesOf = (card: CardWithAttempts, bucket: Bucket) =>
	bucket.repeats && card.type === CardTypeEnum.MultiSheet ? REPETITIONS : 1;

const pickNext = (ctx: ScheduleContext): string[] => {
	const buckets = buildBuckets(ctx);
	const totalWeight = buckets.reduce((acc, bucket) => acc + bucket.weight, 0);
	const scheduled: string[] = [];
	let tries = totalWeight ? MAX_TRIES : 0;
	while (scheduled.length < CARDS_PER_BATCH && tries-- > 0) {
		const bucket = pickBucket(buckets, totalWeight, ctx.random());
		const card = bucket?.take();
		if (!bucket || !card || scheduled.includes(card._id)) continue;
		for (let i = 0; i < copiesOf(card, bucket); i++) scheduled.push(card._id);
	}
	return scheduled;
};

export const speedScheduler: Scheduler = {
	id: 'speed',
	label: 'Speed',
	description: 'Drills new and slow cards until your fingers know them.',
	discardSlowAttempts: true,
	pickNext,
};
