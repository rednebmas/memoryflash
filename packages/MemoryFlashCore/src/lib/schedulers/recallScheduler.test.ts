import { expect } from 'chai';
import { recallScheduler } from './recallScheduler';
import { makeCard, makeContext } from './testHelpers';

describe('recallScheduler', () => {
	const cards = ['a', 'b', 'c', 'd'].map((id) => makeCard(id));

	it('schedules ready cards by due position, then new cards, then waiting cards', () => {
		const reviews = { b: { rung: 1, due: 9 }, c: { rung: 0, due: 4 }, d: { rung: 3, due: 30 } };
		const picked = recallScheduler.pickNext(makeContext({ cards, reviews, clock: 10 }));
		expect(picked).to.deep.equal(['c', 'b', 'a', 'd']);
	});

	it('never runs dry on a small deck where every card is still waiting', () => {
		const reviews = { a: { rung: 5, due: 90 }, b: { rung: 4, due: 50 } };
		const ctx = makeContext({ cards: cards.slice(0, 2), reviews, clock: 10 });
		expect(recallScheduler.pickNext(ctx)).to.deep.equal(['b', 'a']);
	});

	it('skips queued cards and respects the requested count', () => {
		const ctx = makeContext({ cards, queued: ['a'], count: 2 });
		expect(recallScheduler.pickNext(ctx)).to.deep.equal(['b', 'c']);
	});

	it('requeues inline only while the gap fits in the queue', () => {
		expect(recallScheduler.requeueGap({ rung: 1, due: 0 })).to.equal(5);
		expect(recallScheduler.requeueGap({ rung: 3, due: 0 })).to.equal(undefined);
	});
});
