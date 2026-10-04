import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { CardWithAttempts } from 'MemoryFlashCore/src/redux/selectors/currDeckCardsWithAttempts';
import { createRomanNumeralDeck } from 'MemoryFlashCore/src/redux/actions/create-roman-numeral-deck-action';
import { romanNumeralSource } from 'MemoryFlashCore/src/lib/romanNumeralDeck';
import { DropdownItem } from './DropdownMenu';
import { useToast } from './feedback/Toast';

export const useRomanNumeralDeckItem = (card: CardWithAttempts): DropdownItem | null => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const toast = useToast();
	const deck = useAppSelector((state) => state.decks.entities[card.deckId]);
	const question = useMemo(() => romanNumeralSource(card), [card]);
	if (!deck || !question) return null;
	const onCreated = (deckId: string) => {
		toast('Roman numeral deck created');
		navigate(`/study/${deckId}`);
	};
	return {
		label: 'Practice as Roman numerals',
		onClick: () => dispatch(createRomanNumeralDeck(deck, question, onCreated)),
	};
};
