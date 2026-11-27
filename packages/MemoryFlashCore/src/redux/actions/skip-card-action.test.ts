import { expect } from 'chai';
import { playCard, setupDeckStore } from '../testStore';
import { schedule } from './schedule-cards-action';
import { skipCard } from './skip-card-action';
import { UserDeckStatsType } from '../../types/UserDeckStats';

const patchingApi = () => {
	const patched: { url: string; body: Partial<UserDeckStatsType> }[] = [];
	return {
		patched,
		post: async () => ({}),
		patch: async (url: string, body: Partial<UserDeckStatsType>) => {
			patched.push({ url, body });
			return { data: { stats: { _id: 's', deckId: 'd1', ...body } } };
		},
	};
};

const sessionCards = (store: ReturnType<typeof setupDeckStore>) => {
	const { currCard, nextCards } = store.getState().scheduler;
	return [currCard, ...nextCards];
};

describe('skipCard', () => {
	it('saves the skip and takes the card out of the session', async () => {
		const api = patchingApi();
		const store = setupDeckStore({}, api);
		const card = store.getState().scheduler.currCard!;
		await store.dispatch(skipCard('d1', card));
		expect(api.patched[0].url).to.equal('/decks/d1/skipped-cards');
		expect(Object.keys(api.patched[0].body.skippedCards!)).to.deep.equal([card]);
		expect(sessionCards(store)).to.not.include(card);
		expect(store.getState().scheduler.currCard).to.be.a('string');
	});

	it('keeps the card out of later batches until the rest of the deck is played', async () => {
		const store = setupDeckStore({}, patchingApi());
		const card = store.getState().scheduler.currCard!;
		await store.dispatch(skipCard('d1', card));
		const played = new Set<string>();
		while (played.size < 5) {
			const current = store.getState().scheduler.currCard!;
			expect(current).to.not.equal(card);
			played.add(current);
			await playCard(store);
		}
		const returned = [];
		for (let i = 0; i < 40; i++) {
			store.dispatch(schedule('d1'));
			returned.push(store.getState().scheduler.currCard);
			await playCard(store);
		}
		expect(returned).to.include(card);
	});
});
