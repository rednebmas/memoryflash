import { expect } from 'chai';
import { makeTestStore } from '../testStore';
import { networkActions } from '../slices/networkSlice';
import { getStatsDeck } from './get-deck-stats-action';

const statsData = { numCards: 1, statsByCardId: { c1: { attempts: 2 } } };

describe('getStatsDeck', () => {
	it('loads stats without touching the deck request state', async () => {
		const store = makeTestStore();
		store.dispatch(networkActions.set({ name: 'getDeckd1', isLoading: true, error: null }));
		const get = async () => ({ data: statsData });
		await getStatsDeck('d1')(store.dispatch as never, store.getState, {
			api: { get },
		} as never);
		expect(store.getState().userDeckStats.statsByCardId).to.deep.equal(statsData.statsByCardId);
		expect(store.getState().network._['getDeckd1'].isLoading).to.equal(true);
	});
});
