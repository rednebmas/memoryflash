import { authActions } from "../slices/authSlice";
import { AppThunk } from "../store";
import { networkCallWithReduxState } from "../util/networkStateHelper";

export const logout =
	(): AppThunk =>
	async (dispatch, getState, { api, persistStore }) => {
		await networkCallWithReduxState(
			dispatch,
			"auth.logout",
			async () => await api.get("/auth/sign-out")
		);
		dispatch(authActions.completelyResetReduxState());
		persistStore(getState());
	};
