import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types/User';

export interface AuthReduxState {
	user?: User;
	mfaToken?: string;
	resetPasswordToken?: string;
	isAuthenticated?: boolean;
}

const initialState: AuthReduxState = {};

const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		completelyResetReduxState() {
			/** Intentionally blank, see rootReducer */
		},
		setUser(state, action: PayloadAction<User | undefined>) {
			state.user = action.payload;
		},
		setMfaToken(state, action: PayloadAction<string>) {
			state.mfaToken = action.payload;
		},
		setResetPasswordToken(state, action: PayloadAction<string>) {
			state.resetPasswordToken = action.payload;
		},
		setIsAuthenticated(state, action: PayloadAction<boolean>) {
			state.isAuthenticated = action.payload;
		},
	},
});

export const authReducer = authSlice.reducer;
export const authActions = authSlice.actions;
