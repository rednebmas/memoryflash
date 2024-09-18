import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ScreenLoadingState {
	isLoading: boolean;
	error: any | null;
}

export interface NetworkReduxState {
	_: { [key: string]: ScreenLoadingState };
}

const initialState: NetworkReduxState = {
	_: {},
};

const networkSlice = createSlice({
	name: "network",
	initialState,
	reducers: {
		set(state, action: PayloadAction<ScreenLoadingState & { name: string }>) {
			const name = action.payload.name;
			state._[name] = {
				isLoading: action.payload.isLoading,
				error: action.payload.error,
			};
		},
	},
});

export const networkReducer = networkSlice.reducer;
export const networkActions = networkSlice.actions;
