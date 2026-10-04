import { expect } from 'chai';
import { editCardSelector } from './editCardSelector';
import { CardTypeEnum } from '../../types/Cards';
import { ReduxState } from '../store';

const card = { _id: 'c1', deckId: 'd1', type: CardTypeEnum.MultiSheet };

const netState = (isLoading = false) => ({ isLoading, error: null });

const makeState = (opts: { network?: boolean; loading?: boolean; owner?: string }) =>
	({
		auth: { user: { _id: 'u1' } },
		cards: { entities: { c1: card } },
		decks: { entities: { d1: { _id: 'd1', courseId: 'co1' } } },
		courses: { entities: { co1: { _id: 'co1', userId: opts.owner ?? 'u1' } } },
		network: {
			_: opts.network ? { getDeckd1: netState(opts.loading), getDeckd2: netState() } : {},
		},
	}) as never as ReduxState;

describe('editCardSelector', () => {
	it('returns the card when the user owns its deck', () => {
		expect(editCardSelector(makeState({}), 'd1', 'c1')).to.equal(card);
	});

	it('is loading until the deck has been fetched', () => {
		expect(editCardSelector(makeState({}), 'd1', 'missing')).to.equal('loading');
		const loading = makeState({ network: true, loading: true });
		expect(editCardSelector(loading, 'd1', 'missing')).to.equal('loading');
	});

	it('is missing once the deck loaded without the card', () => {
		expect(editCardSelector(makeState({ network: true }), 'd1', 'missing')).to.equal('missing');
	});

	it('is missing for a card in another deck or a deck the user does not own', () => {
		expect(editCardSelector(makeState({ network: true }), 'd2', 'c1')).to.equal('missing');
		const foreign = makeState({ network: true, owner: 'u2' });
		expect(editCardSelector(foreign, 'd1', 'c1')).to.equal('missing');
	});
});
