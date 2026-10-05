import { expect } from 'chai';
import { playCard, setupDeckStore } from '../testStore';
import { recordAttempt } from '../actions/record-attempt-action';
import { restartCard } from '../actions/restart-card-action';
import { missedSelector, retryStatusSelector, wrongNoteSelector } from './retryStatusSelector';

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

	it('keeps the Missed marker until the card moves on while the X marks only this attempt', async () => {
		const store = setupDeckStore({ missRepeats: 1 });
		const marks = () => [missedSelector(store.getState()), wrongNoteSelector(store.getState())];
		expect(marks()).to.deep.equal([false, false]);
		await store.dispatch(recordAttempt(false));
		expect(marks()).to.deep.equal([true, true]);
		store.dispatch(restartCard());
		expect(marks()).to.deep.equal([true, false]);
		await playCard(store);
		expect(marks()).to.deep.equal([true, false]);
		await store.dispatch(recordAttempt(false));
		expect(marks()).to.deep.equal([true, true]);
		await playCard(store);
		await playCard(store);
		expect(marks()).to.deep.equal([false, false]);
	});
});
