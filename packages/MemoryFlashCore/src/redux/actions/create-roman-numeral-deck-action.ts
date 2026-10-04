import { AppThunk } from '../store';
import { Deck } from '../../types/Deck';
import { MultiSheetQuestion } from '../../types/MultiSheetCard';
import { romanNumeralDeckCards } from '../../lib/romanNumeralDeck';
import { createDeck } from './create-deck-action';
import { addCardsToDeck } from './add-cards-to-deck';

export const romanNumeralDeckName = (deckName: string) => `${deckName} · Roman numerals`;

export const createRomanNumeralDeck =
	(deck: Deck, question: MultiSheetQuestion, onCreated: (deckId: string) => void): AppThunk =>
	async (dispatch) => {
		const cards = romanNumeralDeckCards(question);
		if (!cards) return;
		await dispatch(
			createDeck(deck.courseId, romanNumeralDeckName(deck.name), {
				successCb: (created) =>
					dispatch(
						addCardsToDeck(created._id, cards.questions, cards.answers, () =>
							onCreated(created._id),
						),
					),
			}),
		);
	};
