import { expect } from 'chai';
import { recallScheduler } from './recallScheduler';
import { makeCard, makeContext, NOW } from './testHelpers';

const review = (daysFromNow: number) => ({
	interval: 3,
	ease: 2.5,
	due: new Date(NOW.getTime() + daysFromNow * 86400000).toISOString(),
});

describe('recallScheduler', () => {
	const cards = ['a', 'b', 'c', 'd'].map((id) => makeCard(id));

	it('schedules the most overdue cards first, then new cards', () => {
		const reviews = { b: review(-1), c: review(-5) };
		const picked = recallScheduler.pickNext(makeContext({ cards, reviews }));
		expect(picked).to.deep.equal(['c', 'b', 'a', 'd']);
	});

	it('does not schedule cards due in the future', () => {
		const reviews = { a: review(2), b: review(3), c: review(-1), d: review(9) };
		expect(recallScheduler.pickNext(makeContext({ cards, reviews }))).to.deep.equal(['c']);
	});

	it('skips cards that are already queued', () => {
		const picked = recallScheduler.pickNext(makeContext({ cards, queued: ['a', 'b'] }));
		expect(picked).to.deep.equal(['c', 'd']);
	});

	it('schedules nothing when caught up', () => {
		const reviews = { a: review(1), b: review(1), c: review(1), d: review(1) };
		expect(recallScheduler.pickNext(makeContext({ cards, reviews }))).to.deep.equal([]);
	});
});
