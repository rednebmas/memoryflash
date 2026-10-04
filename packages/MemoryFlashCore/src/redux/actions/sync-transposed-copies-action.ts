import { cardsActions } from '../slices/cardsSlice';
import { AppThunk } from '../store';
import { MultiSheetQuestion } from '../../types/MultiSheetCard';
import { Card } from '../../types/Cards';
import { selectTransposedCopyUpdates } from '../selectors/transposedCopiesSelector';

export const syncTransposedCopies =
	(cardId: string, question: MultiSheetQuestion): AppThunk =>
	async (dispatch, getState, { api }) => {
		const updates = selectTransposedCopyUpdates(getState(), cardId, question);
		const cards = await Promise.all(
			updates.map(async ({ id, question }) => {
				const res = await api.patch<{ card: Card }>('/cards/' + id, { question });
				return res.data.card;
			}),
		);
		if (cards.length) dispatch(cardsActions.upsert(cards));
	};
