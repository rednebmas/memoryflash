import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PresentationModeIds } from '../../types/PresentationMode';

export interface SettingsState {
	presentationModes: { [cardType: string]: PresentationModeIds };
}

const initialState: SettingsState = {
	presentationModes: {},
};

const settingsSlice = createSlice({
	name: 'settings',
	initialState,
	reducers: {
		setPresentationMode(
			state,
			action: PayloadAction<{ cardType: string; mode: PresentationModeIds }>,
		) {
			state.presentationModes[action.payload.cardType] = action.payload.mode;
		},
	},
});

export const settingsReducer = settingsSlice.reducer;
export const settingsActions = settingsSlice.actions;
