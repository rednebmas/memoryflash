import { decksActions } from '../slices/decksSlice';
import { AppThunk } from '../store';
import { networkCallWithReduxState } from '../util/networkStateHelper';

export const renameDeck =
	(deckId: string, name: string): AppThunk =>
	async (dispatch, _, { api }) => {
		await networkCallWithReduxState(dispatch, 'renameDeck', async () => {
			const res = await api.patch('/decks/' + deckId, { name });
			dispatch(decksActions.upsert([res.data.deck]));
		});
	};
