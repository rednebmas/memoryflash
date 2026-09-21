import { expect } from 'chai';
import { FIRST_INTERVAL_DAYS, MIN_EASE, STARTING_EASE, nextReview } from './nextReview';
import { NOW } from './testHelpers';

const daysFromNow = (days: number) => new Date(NOW.getTime() + days * 86400000).toISOString();

describe('nextReview', () => {
	it('pushes a new first-try correct card out by the first interval', () => {
		expect(nextReview(undefined, true, NOW)).to.deep.equal({
			interval: FIRST_INTERVAL_DAYS,
			ease: STARTING_EASE,
			due: daysFromNow(FIRST_INTERVAL_DAYS),
		});
	});

	it('grows the interval by ease when a due card is correct', () => {
		const review = nextReview({ interval: 3, ease: 2.5, due: daysFromNow(-1) }, true, NOW);
		expect(review.interval).to.equal(8);
		expect(review.due).to.equal(daysFromNow(8));
	});

	it('resets the interval and lowers ease on a lapse', () => {
		const review = nextReview({ interval: 20, ease: 2.5, due: daysFromNow(0) }, false, NOW);
		expect(review).to.deep.equal({ interval: 1, ease: 2.3, due: daysFromNow(1) });
	});

	it('brings a missed new card back tomorrow', () => {
		expect(nextReview(undefined, false, NOW).interval).to.equal(1);
	});

	it('never drops ease below the floor', () => {
		const review = nextReview({ interval: 1, ease: MIN_EASE, due: daysFromNow(0) }, false, NOW);
		expect(review.ease).to.equal(MIN_EASE);
	});

	it('ignores attempts made before the card is due', () => {
		const prev = { interval: 1, ease: 2.3, due: daysFromNow(1) };
		expect(nextReview(prev, true, NOW)).to.equal(prev);
	});
});
