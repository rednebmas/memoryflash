import { cardsActions } from '../slices/cardsSlice';
import { AppThunk } from '../store';
import { networkCallWithReduxState } from '../util/networkStateHelper';
import { MultiSheetQuestion } from '../../types/MultiSheetCard';
import { Answer } from '../../types/Cards';

export const addCardsToDeck =
	(deckId: string, questions: MultiSheetQuestion[], answer?: Answer): AppThunk =>
	async (dispatch, _, { api }) => {
		await networkCallWithReduxState(dispatch, 'addCardsToDeck', async () => {
			const res = await api.post(`/decks/${deckId}/cards`, {
				questions,
				answer,
			});
			dispatch(cardsActions.upsert(res.data.cards));
		});
	};
