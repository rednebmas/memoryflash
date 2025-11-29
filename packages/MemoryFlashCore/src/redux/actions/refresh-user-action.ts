import { authActions } from '../slices/authSlice';
import { userStatsActions } from '../slices/userStatsSlice';
import { AppThunk } from '../store';
import { getBrowserTimeZone } from '../util/getBrowserTimeZone';
import { hydrateAuthFromResponse } from './shared-auth';
import { networkCallWithReduxState } from '../util/networkStateHelper';

export const refreshUser =
	(): AppThunk =>
	async (dispatch, getState, { api, persistStore }) => {
		await networkCallWithReduxState(dispatch, 'auth.refresh', async () => {
			try {
				const res = await api.get('/auth/me', { params: { tz: getBrowserTimeZone() } });
				hydrateAuthFromResponse(dispatch, res.data);
				persistStore(getState());
			} catch (err: any) {
				dispatch(authActions.setIsAuthenticated(false));
				dispatch(authActions.setUser(undefined));
				dispatch(userStatsActions.setUserStats(undefined));
			}
		});
	};
