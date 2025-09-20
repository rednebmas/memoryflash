import { createSelector } from '@reduxjs/toolkit';
import { ReduxState } from '../store';
import { Card } from '../../types/Cards';
import { Attempt } from '../../types/Attempt';

export type CardWithAttempts = Card & { attempts: Attempt[]; hidden?: boolean };

export const filterCorrect = (cards: { [key: string]: CardWithAttempts }) => {
	const result: typeof cards = {};
	Object.keys(cards).forEach((key) => {
		result[key] = { ...cards[key], attempts: cards[key].attempts.filter((a) => a.correct) };
	});
	return result;
};

export const compareByAttemptTime = (a: CardWithAttempts, b: CardWithAttempts) => {
	const aTime = a.attempts[0]?.timeTaken ?? Infinity;
	const bTime = b.attempts[0]?.timeTaken ?? Infinity;
	return aTime - bTime;
};

const selectDeckId = (state: ReduxState) => state.scheduler.deck;
const selectCards = (state: ReduxState) => state.cards;
const selectAttempts = (state: ReduxState) => state.attempts;
const selectHiddenCardIds = (state: ReduxState) => {
	const deckId = state.scheduler.deck;
	if (!deckId) return [] as string[];
	const stats = Object.values(state.userDeckStats.entities).find((s) => s.deckId === deckId);
	return stats?.hiddenCardIds ?? [];
};

const deckCardsWithAttempts = createSelector(
	[selectDeckId, selectCards, selectAttempts],
	(deckId, cardsRedux, attemptsRedux): { [key: string]: CardWithAttempts } => {
		if (!deckId) return {};
		const cards: { [key: string]: CardWithAttempts } = {};
		Object.values(cardsRedux.entities).forEach((card) => {
			if (card.deckId === deckId) {
				cards[card._id] = { ...card, attempts: [] };
			}
		});
		Object.values(attemptsRedux.entities).forEach((attempt) => {
			const card = cards[attempt.cardId];
			if (attempt.deckId === deckId && card) {
				card.attempts.push(attempt);
				card.attempts.sort(
					(a, b) => new Date(b.attemptedAt).getTime() - new Date(a.attemptedAt).getTime(),
				);
			}
		});
		return cards;
	},
);

export const currDeckAllWithAttemptsSelector = deckCardsWithAttempts;

export const currDeckAllWithCorrectAttemptsSelector = createSelector(
	[currDeckAllWithAttemptsSelector],
	(cards) => filterCorrect(cards),
);

export const currDeckAllWithCorrectAttemptsSortedArray = createSelector(
	[currDeckAllWithCorrectAttemptsSelector, selectHiddenCardIds],
	(cards, hiddenIds) =>
		Object.values(cards)
			.map((c) => ({ ...c, hidden: hiddenIds.includes(c._id) }))
			.sort(compareByAttemptTime),
);

export const currDeckWithAttemptsSelector = createSelector(
	[currDeckAllWithAttemptsSelector, selectHiddenCardIds],
	(cards, hiddenIds) => {
		const filtered: { [key: string]: CardWithAttempts } = {};
		Object.keys(cards).forEach((id) => {
			if (!hiddenIds.includes(id)) filtered[id] = cards[id];
		});
		return filtered;
	},
);

export const currDeckWithCorrectAttemptsSelector = createSelector(
	[currDeckWithAttemptsSelector],
	(cards) => filterCorrect(cards),
);

export const currDeckWithCorrectAttemptsSortedArray = createSelector(
	[currDeckWithCorrectAttemptsSelector],
	(cards) => Object.values(cards).sort(compareByAttemptTime),
);
