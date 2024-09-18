import { createSelector } from '@reduxjs/toolkit';
import { ReduxState } from '../store';

const selectAuthRedux = (state: ReduxState) => state.auth;

export const authSelector = createSelector([selectAuthRedux], (auth) => {
	if (auth.isAuthenticated && auth.user) {
		return 'Authenticated';
	} else if (!auth.isAuthenticated && auth.user) {
		return 'PartiallyAuthenticated';
	} else {
		return 'Unauthenticated';
	}
});
