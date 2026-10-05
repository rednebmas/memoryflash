import { expect } from 'chai';
import { playCard, setupDeckStore } from '../testStore';
import { schedulerActions } from '../slices/schedulerSlice';
import { canRestartCardSelector } from '../selectors/retryStatusSelector';
import { recordAttempt } from './record-attempt-action';
import { restartCard } from './restart-card-action';

describe('restartCard', () => {
	it('is only offered after a miss on the current play', async () => {
		const store = setupDeckStore({ missRepeats: 1 });
		expect(canRestartCardSelector(store.getState())).to.equal(false);
		await store.dispatch(recordAttempt(false));
		expect(canRestartCardSelector(store.getState())).to.equal(true);
		await playCard(store);
		expect(canRestartCardSelector(store.getState())).to.equal(false);
	});

	it('jumps back to the first chord of the same card and still counts the miss', async () => {
		const store = setupDeckStore({ missRepeats: 1 });
		const card = store.getState().scheduler.currCard;
		store.dispatch(schedulerActions.incrementMultiPartCardIndex());
		await store.dispatch(recordAttempt(false));
		const { batchId } = store.getState().scheduler;
		store.dispatch(restartCard());
		const { scheduler } = store.getState();
		expect(scheduler.currCard).to.equal(card);
		expect(scheduler.multiPartCardIndex).to.equal(0);
		expect(scheduler.batchId).to.not.equal(batchId);
		expect(canRestartCardSelector(store.getState())).to.equal(true);
		expect(await playCard(store)).to.equal(card);
		expect(store.posted).to.have.length(1);
		expect(store.posted[0]).to.include({ correct: false });
	});
});
