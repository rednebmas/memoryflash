import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PresentationModeIds } from '../../types/PresentationMode';
import { SaxType } from '../../lib/saxPitch';

export type ChordInputMode = 'piano' | 'names';
export type Instrument = 'piano' | 'sax';

export interface SettingsState {
	presentationModes: { [cardType: string]: PresentationModeIds };
	chordInputMode?: ChordInputMode;
	showSaxFingerings?: boolean;
	instrument?: Instrument;
	saxType?: SaxType;
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
		setChordInputMode(state, action: PayloadAction<ChordInputMode>) {
			state.chordInputMode = action.payload;
		},
		setShowSaxFingerings(state, action: PayloadAction<boolean>) {
			state.showSaxFingerings = action.payload;
		},
		setInstrument(state, action: PayloadAction<Instrument>) {
			state.instrument = action.payload;
		},
		setSaxType(state, action: PayloadAction<SaxType>) {
			state.saxType = action.payload;
		},
	},
});

export const settingsReducer = settingsSlice.reducer;
export const settingsActions = settingsSlice.actions;
