import { authActions } from '../slices/authSlice';
import { AppThunk } from '../store';
import { networkCallWithReduxState } from '../util/networkStateHelper';

export const login =
	(email: string, password: string): AppThunk =>
	async (dispatch, getState, { api, persistStore }) => {
		await networkCallWithReduxState(dispatch, 'auth.login', async () => {
			const res = await api.post('/auth/log-in', { email, password });
			dispatch(authActions.setUser(res.data.user));
			dispatch(authActions.setIsAuthenticated(true));
			persistStore(getState());
		});
	};
