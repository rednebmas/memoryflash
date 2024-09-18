import { userDeckStatsActions } from '../slices/userDeckStatsSlice';
import { AppThunk } from '../store';
import { networkCallWithReduxState } from '../util/networkStateHelper';

export const getStatsDeck =
	(deckId: string): AppThunk =>
	async (dispatch, getState, { api }) => {
		if (getState().network._['getDeck' + deckId + '/stats']?.isLoading) return;
		await networkCallWithReduxState(dispatch, 'getDeck' + deckId, async () => {
			const res = await api.get('/decks/' + deckId + '/stats');
			if (res.data.stats) {
				dispatch(userDeckStatsActions.upsert([res.data.stats]));
			}
			dispatch(userDeckStatsActions.setNumCards(res.data.numCards));
			dispatch(userDeckStatsActions.setStatsByCardId(res.data.statsByCardId));
		});
	};
