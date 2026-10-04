import { expect } from 'chai';
import { makeTestStore } from '../testStore';
import { userDeckStatsActions } from '../slices/userDeckStatsSlice';
import { cardPracticeLabelSelector } from './cardPracticeSelector';

describe('cardPracticeLabelSelector', () => {
	it('shows nothing until the deck stats load', () => {
		expect(cardPracticeLabelSelector(makeTestStore().getState(), 'c1')).to.equal(undefined);
	});

	it('labels practiced and unpracticed cards once stats load', () => {
		const store = makeTestStore();
		const lastAttemptedAt = new Date().toISOString();
		store.dispatch(
			userDeckStatsActions.setStatsByCardId({
				c1: { attempts: 3, lastAttemptedAt, timeStudyingPerDay: {} },
			}),
		);
		expect(cardPracticeLabelSelector(store.getState(), 'c1')).to.equal(
			'3 attempts · practiced today',
		);
		expect(cardPracticeLabelSelector(store.getState(), 'c2')).to.equal('Not practiced yet');
	});
});
