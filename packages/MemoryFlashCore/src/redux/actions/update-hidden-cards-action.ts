import { userDeckStatsActions } from '../slices/userDeckStatsSlice';
import { AppThunk } from '../store';
import { networkCallWithReduxState } from '../util/networkStateHelper';

export const updateHiddenCards =
	(deckId: string, hiddenCardIds: string[]): AppThunk =>
	async (dispatch, _, { api }) => {
		await networkCallWithReduxState(dispatch, 'updateHiddenCards', async () => {
			const res = await api.patch(`/decks/${deckId}/hidden-cards`, { hiddenCardIds });
			dispatch(userDeckStatsActions.upsert([res.data.stats]));
		});
	};
