import { cardsActions } from '../slices/cardsSlice';
import { AppThunk } from '../store';
import { networkCallWithReduxState } from '../util/networkStateHelper';
import { MultiSheetQuestion } from '../../types/MultiSheetCard';
import { Answer } from '../../types/Cards';

export const addCardsToDeck =
	(
		deckId: string,
		questions: MultiSheetQuestion[],
		answer?: Answer | Answer[],
		onSuccess?: (count: number) => void,
		groups?: (string | undefined)[],
	): AppThunk =>
	async (dispatch, _, { api }) => {
		await networkCallWithReduxState(dispatch, 'addCardsToDeck', async () => {
			const res = await api.post(`/decks/${deckId}/cards`, {
				questions,
				answer,
				groups,
			});
			dispatch(cardsActions.upsert(res.data.cards));
			onSuccess?.(res.data.cards.length);
		});
	};
