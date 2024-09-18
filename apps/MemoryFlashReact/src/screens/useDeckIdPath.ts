import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../submodules/MemoryFlashCore/src/redux/store';
import { useParams } from 'react-router-dom';
import { schedulerActions } from '../submodules/MemoryFlashCore/src/redux/slices/schedulerSlice';

export function useDeckIdPath() {
	const dispatch = useAppDispatch();
	const { deckId } = useParams();

	const parsingDeck = useAppSelector((state) => state.scheduler.deck);
	const decks = useAppSelector((state) => state.decks.entities);

	useEffect(() => {
		if (parsingDeck !== deckId && deckId) {
			dispatch(schedulerActions.setParsingDeck(deckId));
		}
	}, [parsingDeck, deckId]);

	return {
		deckId,
		deck: parsingDeck === deckId ? decks[deckId || ''] : undefined,
	};
}
