import { expect } from 'chai';
import { withChordNames, writtenChordNames } from './chordNames';
import { questionsForAllMajorKeys } from './multiKeyTransposer';
import {
	soEasyBb,
	soEasyC,
	soEasyDeck,
	soEasyNamesC,
	soEasyNamesEb,
} from './testData/soEasyToFallInLove';
import {
	groupKeys,
	groupMembers,
	linkAcrossKeys,
	onePerPitch,
	planGroupSave,
	transpositionClusters,
	transpositionInterval,
} from './transpositionGroups';

const keysOf = (deck: { question: { key: string } }[]) => deck.map((c) => c.question.key);
const named = (key: string) =>
	withChordNames(soEasyDeck().find((c) => c.question.key === key)!.question, soEasyNamesEb);
const previewsFrom = (edited: ReturnType<typeof named>, keys: string[]) =>
	questionsForAllMajorKeys(edited, 'C3', 'C5').filter((q) => keys.includes(q.key));

describe('transpositionInterval', () => {
	it("links Sam's real C and Bb cards", () => {
		expect(transpositionInterval(soEasyC, soEasyBb)).to.equal('7m');
	});

	it('rejects cards whose notes differ', () => {
		expect(transpositionInterval(soEasyC, { ...soEasyBb, key: 'C' })).to.equal(null);
	});
});

describe('transpositionClusters', () => {
	it("puts Sam's 12 ungrouped cards in one cluster and leaves unrelated cards out", () => {
		const unrelated = { ...soEasyDeck()[0], _id: 'x', question: { ...soEasyBb, key: 'C' } };
		const other = { ...soEasyDeck()[1], _id: 'other-deck', deckId: 'd2' };
		const clusters = transpositionClusters([...soEasyDeck(), unrelated, other]);
		expect(clusters.map(keysOf)).to.deep.equal([keysOf(soEasyDeck())]);
	});
});

describe('groupMembers and groupKeys', () => {
	it('finds every card in the group from any member', () => {
		const deck = [...soEasyDeck('g1'), { ...soEasyDeck()[0], _id: 'solo' }];
		expect(groupMembers(deck, deck[10]).map((c) => c._id)).to.deep.equal(
			keysOf(deck.slice(0, 12)),
		);
		expect(groupKeys(deck, [], deck[10])).to.deep.equal(keysOf(soEasyDeck()));
	});

	it('leaves out hidden members, and an ungrouped card is only its own key', () => {
		const deck = soEasyDeck('g1');
		expect(groupKeys(deck, ['G', 'D'], deck[10])).to.have.length(10);
		expect(groupKeys(soEasyDeck(), [], soEasyDeck()[10])).to.deep.equal(['Eb']);
	});
});

describe('planGroupSave', () => {
	const deck = soEasyDeck('g1');
	const eb = deck.find((c) => c._id === 'Eb')!;

	it('editing the Eb copy updates all 12 cards, keeping the C card’s notes', () => {
		const plan = planGroupSave(deck, [], eb, previewsFrom(named('Eb'), keysOf(deck)));
		expect(plan.updates.map((u) => u.id).sort()).to.deep.equal(keysOf(deck).sort());
		expect(plan.add).to.deep.equal([]);
		const c = plan.updates.find((u) => u.id === 'C')!.question;
		expect(c.voices.map((v) => v.stack.map((s) => s.notes))).to.deep.equal(
			soEasyC.voices.map((v) => v.stack.map((s) => s.notes)),
		);
		expect(writtenChordNames(c)).to.deep.equal(soEasyNamesC);
	});

	it('adds a ticked new key once and hides an unticked one', () => {
		const withoutD = deck.filter((c) => c._id !== 'D');
		const keys = [...keysOf(withoutD).filter((k) => k !== 'G'), 'D'];
		const plan = planGroupSave(withoutD, [], eb, previewsFrom(named('Eb'), keys));
		expect(keysOf(plan.add.map((question) => ({ question })))).to.deep.equal(['D']);
		expect(plan.hide).to.deep.equal(['G']);
		expect(plan.updates.map((u) => u.id)).not.to.include('G');
	});

	it('re-ticking a hidden key restores the same card instead of adding one', () => {
		const plan = planGroupSave(deck, ['G'], eb, previewsFrom(named('Eb'), keysOf(deck)));
		expect(plan.unhide).to.deep.equal(['G']);
		expect(plan.add).to.deep.equal([]);
		expect(plan.updates.map((u) => u.id)).to.include('G');
	});

	it('moves the edited card to its new key when the key was changed', () => {
		const g = previewsFrom(named('Eb'), ['G'])[0];
		const plan = planGroupSave(deck, [], eb, [g], 'G');
		expect(plan.updates).to.deep.equal([{ id: 'Eb', question: g }]);
		expect(plan.hide).to.include('G');
		expect(plan.add).to.deep.equal([]);
	});

	it('keeps the edited card’s exact notes', () => {
		const edited = { ...named('Eb'), key: 'Eb' };
		const plan = planGroupSave([eb], [], eb, [edited]);
		expect(plan.updates).to.deep.equal([{ id: 'Eb', question: edited }]);
	});
});

describe('enharmonic keys', () => {
	const deck = soEasyDeck('g1');
	const cSharp = deck.find((c) => c._id === 'C#')!;

	it('keeps one key per pitch, preferring the given spellings', () => {
		const keys = ['C', 'F#', 'C#', 'Db', 'Gb'];
		expect(onePerPitch(keys, (k) => k)).to.deep.equal(['C', 'F#', 'C#']);
		expect(onePerPitch(keys, (k) => k, ['Db'])).to.deep.equal(['C', 'F#', 'Db']);
	});

	it('treats a Db preview as the group’s C# card instead of adding a card', () => {
		const keys = [...keysOf(deck).filter((k) => k !== 'C#'), 'Db'];
		const plan = planGroupSave(deck, [], deck[10], previewsFrom(named('Eb'), keys));
		expect(plan.add).to.deep.equal([]);
		expect(plan.hide).to.deep.equal([]);
		expect(plan.updates.find((u) => u.id === cSharp._id)?.question.key).to.equal('Db');
	});
});

describe('linkAcrossKeys', () => {
	it('gives each segment one group shared across its keys', () => {
		let n = 0;
		const rows = [
			[soEasyC, soEasyC],
			[soEasyBb, soEasyBb],
		];
		const { questions, groups } = linkAcrossKeys(rows, () => `g${n++}`);
		expect(keysOf(questions.map((question) => ({ question })))).to.deep.equal([
			'C',
			'Bb',
			'C',
			'Bb',
		]);
		expect(groups).to.deep.equal(['g0', 'g0', 'g1', 'g1']);
	});

	it('does not group a card added in one key', () => {
		expect(linkAcrossKeys([[soEasyC]], () => 'g').groups).to.deep.equal([undefined]);
	});
});
