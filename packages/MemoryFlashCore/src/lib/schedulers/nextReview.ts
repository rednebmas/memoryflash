import { CardReview } from './types';

const FIRST_GAPS = [2, 5, 10];
const NEW_CARD = -1;

export const gapForRung = (rung: number): number =>
	FIRST_GAPS[rung] ?? FIRST_GAPS[FIRST_GAPS.length - 1] * 2 ** (rung - FIRST_GAPS.length + 1);

export const nextReview = (
	prev: CardReview | undefined,
	correct: boolean,
	clock: number,
): CardReview => {
	const last = prev?.rung ?? NEW_CARD;
	const rung = correct ? last + 1 : Math.max(0, last - 1);
	return { rung, due: clock + 1 + gapForRung(rung) };
};
