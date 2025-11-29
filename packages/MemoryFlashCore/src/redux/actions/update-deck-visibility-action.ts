import { decksActions } from '../slices/decksSlice';
import { AppThunk } from '../store';
import { networkCallWithReduxState } from '../util/networkStateHelper';
import { Visibility } from '../../types/Deck';

export const updateDeckVisibility =
	(deckId: string, visibility: Visibility): AppThunk =>
	async (dispatch, _, { api }) => {
		await networkCallWithReduxState(dispatch, 'updateDeckVisibility', async () => {
			const res = await api.patch(`/decks/${deckId}/visibility`, { visibility });
			dispatch(decksActions.upsert([res.data.deck]));
		});
	};
