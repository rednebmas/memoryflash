import { SchedulerChoice } from '../../lib/schedulers/types';
import { userDeckStatsActions } from '../slices/userDeckStatsSlice';
import { AppThunk } from '../store';
import { networkCallWithReduxState } from '../util/networkStateHelper';

export const updateDeckScheduler =
	(deckId: string, scheduler: SchedulerChoice): AppThunk =>
	async (dispatch, _, { api }) => {
		await networkCallWithReduxState(dispatch, 'updateDeckScheduler', async () => {
			const res = await api.patch(`/decks/${deckId}/scheduler`, { scheduler });
			dispatch(userDeckStatsActions.upsert([res.data.stats]));
		});
	};
