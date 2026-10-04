import { expect } from 'chai';
import { makeTestStore } from '../testStore';
import { StaffEnum } from '../../types/Cards';
import { addCardsToDeck } from './add-cards-to-deck';

const question = { key: 'C', voices: [{ staff: StaffEnum.Treble, stack: [] }] };

const run = async (post: () => Promise<{ data: { cards: object[] } }>) => {
	const store = makeTestStore();
	const added: number[] = [];
	const thunk = addCardsToDeck('d1', [question, question], undefined, (n) => added.push(n));
	await thunk(store.dispatch as never, store.getState, { api: { post } } as never);
	return { store, added };
};

describe('addCardsToDeck', () => {
	it('reports how many cards were added on success', async () => {
		const cards = [{ _id: 'a' }, { _id: 'b' }];
		const { store, added } = await run(async () => ({ data: { cards } }));
		expect(added).to.deep.equal([2]);
		expect(store.getState().cards.ids).to.have.length(2);
	});

	it('does not report success when the request fails', async () => {
		const { store, added } = await run(async () => {
			throw new Error('Network Error');
		});
		expect(added).to.deep.equal([]);
		expect(store.getState().network._.addCardsToDeck?.error).to.be.a('string');
	});
});
