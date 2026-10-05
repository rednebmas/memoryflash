import { expect } from 'chai';
import { playCard, setupDeckStore } from '../testStore';
import { recordAttempt } from '../actions/record-attempt-action';
import { retryStatusSelector } from './retryStatusSelector';

describe('retryStatusSelector', () => {
	it('shows nothing for a card played right the first time', async () => {
		const store = setupDeckStore();
		expect(retryStatusSelector(store.getState())).to.equal(undefined);
		await playCard(store);
		expect(retryStatusSelector(store.getState())).to.equal(undefined);
	});

	it('counts down the right plays a missed card still needs and resets on another miss', async () => {
		const store = setupDeckStore({ missRepeats: 2 });
		await store.dispatch(recordAttempt(false));
		expect(retryStatusSelector(store.getState())).to.equal(
			'Missed · play it right 2 more times',
		);
		await playCard(store);
		expect(retryStatusSelector(store.getState())).to.equal(
			'Missed · play it right 2 more times',
		);
		await playCard(store);
		expect(retryStatusSelector(store.getState())).to.equal(
			'Missed · play it right 1 more time',
		);
		await store.dispatch(recordAttempt(false));
		expect(retryStatusSelector(store.getState())).to.equal(
			'Missed · play it right 2 more times',
		);
		await playCard(store);
		await playCard(store);
		await playCard(store);
		expect(retryStatusSelector(store.getState())).to.equal(undefined);
	});
});
