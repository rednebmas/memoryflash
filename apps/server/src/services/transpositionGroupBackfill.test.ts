import { expect } from 'chai';
import { Types } from 'mongoose';
import { seed } from '../config/test-seed';
import { setupDBConnectionForTesting } from '../config/test-setup';
import { Card } from '../models/Card';
import { DeckDoc } from '../models/Deck';
import Course from '../models/Course';
import { UserDoc } from '../models';
import { soEasyBb, soEasyDeck } from 'MemoryFlashCore/src/lib/testData/soEasyToFallInLove';
import { backfillTranspositionGroups } from './transpositionGroupBackfill';
import { addCardsToDeck } from './deckService';
import { updateCard } from './cardService';

const insert = (deck: DeckDoc, uidPrefix: string) =>
	Card.insertMany(
		soEasyDeck().map(({ _id, createdAt, updatedAt, ...c }, i) => ({
			...c,
			uid: `${uidPrefix}-${i}`,
			deckId: deck._id,
		})),
	);

const groupsIn = async (deckId: Types.ObjectId | string, uid: RegExp) =>
	(await Card.find({ deckId, uid })).map((c) => c.transpositionGroup);

describe('backfillTranspositionGroups', () => {
	let deck: DeckDoc;
	setupDBConnectionForTesting();

	beforeEach(async () => {
		deck = (await seed()).deck;
	});

	it("links Sam's 12 custom transposed cards into one group, once", async () => {
		await insert(deck, 'custom-so-easy');
		await Card.create({
			...soEasyDeck()[0],
			_id: undefined,
			uid: 'custom-x',
			deckId: deck._id,
			question: { ...soEasyBb, key: 'C' },
		});
		await backfillTranspositionGroups();
		const groups = await groupsIn(deck._id, /^custom-so-easy/);
		expect(groups).to.have.length(12);
		expect(new Set(groups).size).to.equal(1);
		expect(groups[0]).to.be.a('string');
		expect(await groupsIn(deck._id, /^custom-x/)).to.deep.equal([undefined]);
		await backfillTranspositionGroups();
		expect(await groupsIn(deck._id, /^custom-so-easy/)).to.deep.equal(groups);
	});

	it('leaves built-in course cards alone', async () => {
		await insert(deck, 'builtin');
		await backfillTranspositionGroups();
		expect(new Set(await groupsIn(deck._id, /^builtin/))).to.deep.equal(new Set([undefined]));
	});
});

describe('transposition group on save', () => {
	let deck: DeckDoc, user: UserDoc;
	setupDBConnectionForTesting();

	beforeEach(async () => {
		({ deck, user } = await seed());
		await Course.updateOne({ _id: deck.courseId }, { userId: user._id });
	});

	it('stores the group given for each added card and on update', async () => {
		const [c, g] = soEasyDeck().map((card) => card.question);
		const cards = await addCardsToDeck(
			deck._id.toString(),
			[c, g],
			user._id.toString(),
			undefined,
			['g1', 'g1'],
		);
		expect(cards.map((card) => card.transpositionGroup)).to.deep.equal(['g1', 'g1']);
		const solo = (await addCardsToDeck(deck._id.toString(), [c]))[0];
		expect(solo.transpositionGroup).to.equal(undefined);
		const updated = await updateCard(
			solo._id.toString(),
			c,
			user._id.toString(),
			undefined,
			'g2',
		);
		expect(updated?.transpositionGroup).to.equal('g2');
	});
});
