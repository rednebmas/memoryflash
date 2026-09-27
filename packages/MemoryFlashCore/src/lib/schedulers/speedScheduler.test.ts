import { expect } from 'chai';
import { CardTypeEnum } from '../../types/Cards';
import { speedScheduler } from './speedScheduler';
import { makeCard, makeContext } from './testHelpers';

describe('speedScheduler', () => {
	it('schedules nothing for an empty deck', () => {
		expect(speedScheduler.pickNext(makeContext({}))).to.deep.equal([]);
	});

	it('schedules new cards in order without duplicates', () => {
		const cards = ['a', 'b', 'c', 'd', 'e'].map((id) => makeCard(id));
		const picked = speedScheduler.pickNext(makeContext({ cards, random: () => 0 }));
		expect(picked).to.deep.equal(['a', 'b', 'c', 'd']);
	});

	it('never queues the same card twice in a batch', () => {
		const cards = ['a', 'b', 'c'].map((id) => makeCard(id, undefined, CardTypeEnum.MultiSheet));
		const picked = speedScheduler.pickNext(makeContext({ cards, random: () => 0 }));
		expect(picked).to.deep.equal(['a', 'b', 'c']);
	});

	it('prefers slow cards but still includes fast ones once slow cards run out', () => {
		const cards = [makeCard('fast', 1), makeCard('slow', 9), makeCard('slower', 20)];
		const lowRoll = speedScheduler.pickNext(makeContext({ cards, random: () => 0.1 }));
		const highRoll = speedScheduler.pickNext(makeContext({ cards, random: () => 0.9 }));
		expect(lowRoll[0]).to.equal('fast');
		expect(highRoll.slice(0, 2)).to.have.members(['slow', 'slower']);
		expect(highRoll[2]).to.equal('fast');
	});

	it('shows every card of a small deck in each batch', () => {
		const cards = [makeCard('F', 2), makeCard('A', 3), makeCard('C', 4), makeCard('E', 1)];
		const picked = speedScheduler.pickNext(makeContext({ cards, random: () => 0.9 }));
		expect(picked).to.have.members(['F', 'A', 'C', 'E']);
	});

	it('skips cards that are already queued so nothing plays twice in a row', () => {
		const cards = ['F', 'A', 'C', 'E'].map((id) => makeCard(id));
		const picked = speedScheduler.pickNext(makeContext({ cards, queued: ['C', 'E'] }));
		expect(picked).to.have.members(['F', 'A']);
	});
});
