import { decksActions } from '../slices/decksSlice';
import { AppThunk } from '../store';
import { networkCallWithReduxState } from '../util/networkStateHelper';

export const deleteDeck =
	(deckId: string): AppThunk =>
	async (dispatch, _, { api }) => {
		await networkCallWithReduxState(dispatch, 'deleteDeck', async () => {
			await api.delete('/decks/' + deckId);
			dispatch(decksActions.remove(deckId));
		});
	};
