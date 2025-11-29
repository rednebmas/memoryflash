import { AppThunk } from '../store';
import { getBrowserTimeZone } from '../util/getBrowserTimeZone';
import { networkCallWithReduxState } from '../util/networkStateHelper';
import { hydrateAuthFromResponse } from './shared-auth';

export const login =
	(email: string, password: string): AppThunk =>
	async (dispatch, getState, { api, persistStore }) => {
		await networkCallWithReduxState(dispatch, 'auth.login', async () => {
			const res = await api.post(
				'/auth/log-in',
				{ email, password },
				{ params: { tz: getBrowserTimeZone() } },
			);
			hydrateAuthFromResponse(dispatch, res.data);
			persistStore(getState());
		});
	};
