import { expect } from 'chai';
import { activeSkippedCardIds } from './skippedCards';
import { makeCard } from './schedulers/testHelpers';
import { CardWithAttempts } from '../types/CardWithAttempts';

const at = (hour: number, day = 20) => new Date(2026, 8, day, hour);

const attemptedAt = (card: CardWithAttempts, date: Date, correct = true): CardWithAttempts => ({
	...card,
	attempts: [
		{ ...makeCard(card._id, 1000).attempts[0], correct, attemptedAt: date.toISOString() },
	],
});

describe('activeSkippedCardIds', () => {
	const skipped = { a: at(9).toISOString() };

	it('keeps a card skipped while other cards are still unstudied today', () => {
		const cards = [makeCard('a'), attemptedAt(makeCard('b'), at(10)), makeCard('c')];
		expect(activeSkippedCardIds(skipped, cards, at(11))).to.deep.equal(['a']);
	});

	it('returns the card once every other card was attempted after the skip', () => {
		const cards = [
			makeCard('a'),
			attemptedAt(makeCard('b'), at(10)),
			attemptedAt(makeCard('c'), at(10), false),
		];
		expect(activeSkippedCardIds(skipped, cards, at(11))).to.deep.equal([]);
	});

	it('ignores attempts made before the skip', () => {
		const cards = [makeCard('a'), attemptedAt(makeCard('b'), at(8))];
		expect(activeSkippedCardIds(skipped, cards, at(11))).to.deep.equal(['a']);
	});

	it('returns the card on the next day', () => {
		const cards = [makeCard('a'), makeCard('b')];
		expect(activeSkippedCardIds(skipped, cards, at(1, 21))).to.deep.equal([]);
	});

	it('does not wait on other skipped cards to be studied', () => {
		const both = { a: at(9).toISOString(), b: at(9).toISOString() };
		const cards = [makeCard('a'), makeCard('b'), attemptedAt(makeCard('c'), at(10))];
		expect(activeSkippedCardIds(both, cards, at(11))).to.deep.equal([]);
	});

	it('handles no skips', () => {
		expect(activeSkippedCardIds(undefined, [makeCard('a')], at(11))).to.deep.equal([]);
	});
});
