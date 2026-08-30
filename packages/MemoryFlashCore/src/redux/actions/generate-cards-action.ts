import { generatedCardsActions } from '../slices/generatedCardsSlice';
import { AppThunk } from '../store';
import { networkCallWithReduxState } from '../util/networkStateHelper';
import { GenerateCardsInput } from '../../types/GeneratedCards';

export const generateCards =
	(deckId: string, input: GenerateCardsInput): AppThunk =>
	async (dispatch, _, { api }) => {
		await networkCallWithReduxState(dispatch, 'generateCards', async () => {
			const res = await api.post(`/decks/${deckId}/generate-cards`, input);
			dispatch(generatedCardsActions.setSong(res.data.song));
		});
	};
