import { Dispatch } from '@reduxjs/toolkit';
import { authActions } from '../slices/authSlice';
import { userStatsActions } from '../slices/userStatsSlice';

export const hydrateAuthFromResponse = (
	dispatch: Dispatch,
	payload: { user?: any; userStats?: any },
) => {
	if (payload.user) {
		dispatch(authActions.setUser(payload.user));
	}
	dispatch(userStatsActions.setUserStats(payload.userStats));
	dispatch(authActions.setIsAuthenticated(!!payload.user));
};
