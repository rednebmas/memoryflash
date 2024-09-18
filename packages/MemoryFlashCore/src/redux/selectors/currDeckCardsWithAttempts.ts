import { createSelector } from '@reduxjs/toolkit';
import { ReduxState } from '../store';
import { Card } from '../../types/Cards';
import { Attempt } from '../../types/Attempt';

const selectParsingDeckRedux = (state: ReduxState) => state.scheduler.deck;
const selectCardsRedux = (state: ReduxState) => state.cards;
const selectAttemptsRedux = (state: ReduxState) => state.attempts;

export type CardWithAttempts = Card & { attempts: Attempt[] };

export const currDeckWithAttemptsSelector = createSelector(
	[selectParsingDeckRedux, selectCardsRedux, selectAttemptsRedux],
	(parsingDeck, cardsRedux, attemptsRedux): { [key: string]: CardWithAttempts } => {
		if (!parsingDeck) {
			return {};
		}

		const cards: { [key: string]: CardWithAttempts } = {};
		Object.values(cardsRedux.entities).forEach((card) => {
			if (card.deckId === parsingDeck) {
				cards[card._id] = { ...card, attempts: [] };
			}
		});

		Object.values(attemptsRedux.entities).forEach((attempt) => {
			if (attempt.deckId === parsingDeck && cards[attempt.cardId]) {
				cards[attempt.cardId].attempts.push(attempt);

				// sort by newest attempt first
				cards[attempt.cardId].attempts.sort((a, b) => {
					return new Date(b.attemptedAt).getTime() - new Date(a.attemptedAt).getTime();
				});
			}
		});

		return cards;
	},
);

export const currDeckWithCorrectAttemptsSelector = createSelector(
	[currDeckWithAttemptsSelector],
	(cards) => {
		const cardsWithCorrectAttempts: typeof cards = {};
		Object.keys(cards).forEach((key) => {
			cardsWithCorrectAttempts[key] = {
				...cards[key],
				attempts: cards[key].attempts.filter((attempt) => attempt.correct),
			};
		});
		return cardsWithCorrectAttempts;
	},
);

export const currDeckWithCorrectAttemptsSortedArray = createSelector(
	[currDeckWithCorrectAttemptsSelector],
	(cards) => {
		return Object.values(cards).sort((a, b) => {
			// Check if the first card has no attempts or if the first attempt lacks a timeTaken value
			const aTime = a.attempts.length > 0 ? a.attempts[0].timeTaken : Infinity;
			const bTime = b.attempts.length > 0 ? b.attempts[0].timeTaken : Infinity;

			// Compare based on the timeTaken, with cards having no attempts being treated as having a timeTaken of Infinity
			return aTime - bTime;
		});
	},
);
