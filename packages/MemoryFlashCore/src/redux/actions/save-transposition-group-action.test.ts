import { expect } from 'chai';
import { makeTestStore } from '../testStore';
import { cardsActions } from '../slices/cardsSlice';
import { userDeckStatsActions } from '../slices/userDeckStatsSlice';
import { UserDeckStatsType } from '../../types/UserDeckStats';
import { MultiSheetQuestion } from '../../types/MultiSheetCard';
import { withChordNames } from '../../lib/chordNames';
import { questionsForAllMajorKeys } from '../../lib/multiKeyTransposer';
import { soEasyDeck, soEasyNamesEb } from '../../lib/testData/soEasyToFallInLove';
import { SheetCard } from '../../lib/transpositionGroups';
import { saveTranspositionGroup } from './save-transposition-group-action';

type Body = {
	question?: MultiSheetQuestion;
	transpositionGroup?: string;
	questions?: MultiSheetQuestion[];
	groups?: string[];
	hiddenCardIds?: string[];
};

const stats = { _id: 's', deckId: 'd1', hiddenCardIds: [] } as never as UserDeckStatsType;

const run = async (cards: SheetCard[], cardId: string, keys: string[]) => {
	const calls: { method: string; url: string; body: Body }[] = [];
	const respond = (method: string) => async (url: string, body: Body) => {
		calls.push({ method, url, body });
		const card = { ...cards[0], _id: url.split('/').pop(), ...body };
		return { data: { card, cards: [], stats: { ...stats, ...body } } };
	};
	const store = makeTestStore({ patch: respond('PATCH'), post: respond('POST') });
	store.dispatch(cardsActions.upsert(cards));
	store.dispatch(userDeckStatsActions.upsert([stats]));
	const edited = withChordNames(cards.find((c) => c._id === cardId)!.question, soEasyNamesEb);
	const previews = questionsForAllMajorKeys(edited, 'C3', 'C5').filter((q) =>
		keys.includes(q.key),
	);
	await store.dispatch(saveTranspositionGroup(cardId, cardId, previews));
	return calls;
};

describe('saveTranspositionGroup', () => {
	const allKeys = soEasyDeck().map((c) => c.question.key);

	it('editing the Eb copy updates the group, adds Db once and hides G', async () => {
		const keys = [...allKeys.filter((k) => k !== 'G'), 'Db'];
		const calls = await run(soEasyDeck('g1'), 'Eb', keys);
		const patched = calls.filter((c) => c.url.startsWith('/cards/'));
		expect(patched.map((c) => c.url.split('/')[2]).sort()).to.deep.equal(
			allKeys.filter((k) => k !== 'G').sort(),
		);
		expect(patched.every((c) => c.body.transpositionGroup === 'g1')).to.equal(true);
		const added = calls.find((c) => c.method === 'POST')!.body;
		expect(added.questions!.map((q) => q.key)).to.deep.equal(['Db']);
		expect(added.groups).to.deep.equal(['g1']);
		const hidden = calls.find((c) => c.url.endsWith('/hidden-cards'))!.body;
		expect(hidden.hiddenCardIds).to.deep.equal(['G']);
	});

	it('links an ungrouped card to the keys added while editing it', async () => {
		const calls = await run(soEasyDeck().slice(0, 1), 'C', ['C', 'G']);
		const group = calls.find((c) => c.url === '/cards/C')!.body.transpositionGroup;
		expect(group).to.be.a('string');
		expect(calls.find((c) => c.method === 'POST')!.body.groups).to.deep.equal([group]);
		expect(calls.some((c) => c.url.endsWith('/hidden-cards'))).to.equal(false);
	});

	it('leaves a single-key card ungrouped', async () => {
		const calls = await run(soEasyDeck().slice(0, 1), 'C', ['C']);
		expect(calls.map((c) => c.url)).to.deep.equal(['/cards/C']);
		expect(calls[0].body.transpositionGroup).to.equal(undefined);
	});
});
