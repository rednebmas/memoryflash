import { authActions } from '../slices/authSlice';
import { AppThunk } from '../store';
import { networkCallWithReduxState } from '../util/networkStateHelper';

export const signUp =
	(email: string, password: string, firstName: string, lastName?: string): AppThunk =>
	async (dispatch, getState, { api, persistStore }) => {
		await networkCallWithReduxState(dispatch, 'auth.signup', async () => {
			const res = await api.post('/auth/sign-up', { email, password, firstName, lastName });
			dispatch(authActions.setUser(res.data.user));
			dispatch(authActions.setIsAuthenticated(true));
			persistStore(getState());
		});
	};
