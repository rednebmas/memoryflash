import { expect } from 'chai';
import { makeTestStore } from '../testStore';
import { StaffEnum } from '../../types/Cards';
import { Deck } from '../../types/Deck';
import { MultiSheetQuestion } from '../../types/MultiSheetCard';
import { createRomanNumeralDeck } from './create-roman-numeral-deck-action';

const deck = { _id: 'd1', courseId: 'c1', name: 'Four bars' } as Deck;
const question = (notes: string[]): MultiSheetQuestion => ({
	key: 'C',
	voices: [
		{
			staff: StaffEnum.Treble,
			stack: [{ notes: notes.map((name) => ({ name, octave: 4 })), duration: 'w' }],
		},
	],
});

type Body = { name?: string; questions?: object[] };

const run = async (q: MultiSheetQuestion) => {
	const posts: { url: string; body: Body }[] = [];
	const post = async (url: string, body: Body) => {
		posts.push({ url, body });
		if (url === '/decks') return { data: { deck: { _id: 'new', courseId: 'c1' } } };
		return { data: { cards: body.questions?.map((_, i) => ({ _id: `card${i}` })) } };
	};
	const store = makeTestStore(post);
	const created: string[] = [];
	await store.dispatch(createRomanNumeralDeck(deck, q, (id) => created.push(id)));
	await new Promise((resolve) => setImmediate(resolve));
	return { posts, created, store };
};

describe('createRomanNumeralDeck', () => {
	it('creates a sibling deck with roman numeral cards for every key', async () => {
		const { posts, created, store } = await run(question(['C', 'E', 'G']));
		expect(posts[0]).to.deep.equal({
			url: '/decks',
			body: { courseId: 'c1', name: 'Four bars · Roman numerals' },
		});
		expect(posts[1].url).to.equal('/decks/new/cards');
		expect(posts[1].body.questions).to.have.length(12);
		expect(created).to.deep.equal(['new']);
		expect(store.getState().cards.ids).to.have.length(12);
	});

	it('does nothing when the card has no chords', async () => {
		const { posts, created } = await run(question(['C']));
		expect(posts).to.deep.equal([]);
		expect(created).to.deep.equal([]);
	});
});
