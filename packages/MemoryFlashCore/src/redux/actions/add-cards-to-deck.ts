import { cardsActions } from '../slices/cardsSlice';
import { AppThunk } from '../store';
import { networkCallWithReduxState } from '../util/networkStateHelper';
import { MultiSheetQuestion } from '../../types/MultiSheetCard';

export const addCardsToDeck =
	(deckId: string, questions: MultiSheetQuestion[]): AppThunk =>
	async (dispatch, _, { api }) => {
		await networkCallWithReduxState(dispatch, 'addCardsToDeck', async () => {
			const res = await api.post(`/decks/${deckId}/cards`, {
				questions,
			});
			dispatch(cardsActions.upsert(res.data.cards));
		});
	};
