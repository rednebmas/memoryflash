import { RhythmSettings } from '../../lib/rhythm/types';
import { userDeckStatsActions } from '../slices/userDeckStatsSlice';
import { AppThunk } from '../store';
import { networkCallWithReduxState } from '../util/networkStateHelper';

export const updateDeckRhythm =
	(deckId: string, rhythm: RhythmSettings): AppThunk =>
	async (dispatch, _, { api }) => {
		await networkCallWithReduxState(dispatch, 'updateDeckRhythm', async () => {
			const res = await api.patch(`/decks/${deckId}/rhythm`, { rhythm });
			dispatch(userDeckStatsActions.upsert([res.data.stats]));
		});
	};
