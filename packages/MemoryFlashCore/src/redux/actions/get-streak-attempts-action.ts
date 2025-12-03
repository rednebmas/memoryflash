import { attemptsActions } from '../slices/attemptsSlice';
import { AppThunk } from '../store';
import { networkCallWithReduxState } from '../util/networkStateHelper';

export const getStreakAttempts = (): AppThunk => async (dispatch, getState, { api }) => {
	if (getState().network._['getStreakAttempts']?.isLoading) return;
	await networkCallWithReduxState(dispatch, 'getStreakAttempts', async () => {
		const res = await api.get('/attempts/streak');
		dispatch(attemptsActions.upsert(res.data));
	});
};
