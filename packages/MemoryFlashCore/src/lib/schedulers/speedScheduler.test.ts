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

	it('repeats new multi-sheet cards', () => {
		const cards = ['a', 'b', 'c'].map((id) => makeCard(id, undefined, CardTypeEnum.MultiSheet));
		const picked = speedScheduler.pickNext(makeContext({ cards, random: () => 0 }));
		expect(picked).to.deep.equal(['a', 'a', 'b', 'b']);
	});

	it('picks fast cards only in their small slice of the distribution', () => {
		const cards = [makeCard('fast', 1), makeCard('slow', 9), makeCard('slower', 20)];
		const lowRoll = speedScheduler.pickNext(makeContext({ cards, random: () => 0.1 }));
		const highRoll = speedScheduler.pickNext(makeContext({ cards, random: () => 0.9 }));
		expect(lowRoll).to.deep.equal(['fast']);
		expect(highRoll).to.not.include('fast');
		expect(highRoll).to.have.members(['slow', 'slower']);
	});
});
