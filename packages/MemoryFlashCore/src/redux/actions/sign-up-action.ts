import { authActions } from '../slices/authSlice';
import { userStatsActions } from '../slices/userStatsSlice';
import { AppThunk } from '../store';
import { getBrowserTimeZone } from '../util/getBrowserTimeZone';
import { networkCallWithReduxState } from '../util/networkStateHelper';
import { hydrateAuthFromResponse } from './shared-auth';

export const signUp =
	(email: string, password: string, firstName: string, lastName?: string): AppThunk =>
	async (dispatch, getState, { api, persistStore }) => {
		await networkCallWithReduxState(dispatch, 'auth.signup', async () => {
			const res = await api.post(
				'/auth/sign-up',
				{ email, password, firstName, lastName },
				{ params: { tz: getBrowserTimeZone() } },
			);
			hydrateAuthFromResponse(dispatch, res.data);
			persistStore(getState());
		});
	};
