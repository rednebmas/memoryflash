import { userDeckStatsActions } from '../slices/userDeckStatsSlice';
import { AppThunk } from '../store';
import { networkCallWithReduxState } from '../util/networkStateHelper';

export const getStatsDeck =
	(deckId: string): AppThunk =>
	async (dispatch, getState, { api }) => {
		const key = 'getDeck' + deckId + '/stats';
		if (getState().network._[key]?.isLoading) return;
		await networkCallWithReduxState(dispatch, key, async () => {
			const res = await api.get('/decks/' + deckId + '/stats');
			if (res.data.stats) {
				dispatch(userDeckStatsActions.upsert([res.data.stats]));
			}
			dispatch(userDeckStatsActions.setNumCards(res.data.numCards));
			dispatch(userDeckStatsActions.setStatsByCardId(res.data.statsByCardId));
		});
	};
