import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PresentationModeIds } from '../../types/PresentationMode';
import { SaxType } from '../../lib/saxPitch';
import { ToneMode } from '../../lib/saxTone';
import {
	DEFAULT_MIDI_ACTION_KEYS,
	MIDI_ACTIONS,
	MidiActionKey,
	MidiActionKeys,
} from '../../lib/midiActionKeys';

export type ChordInputMode = 'piano' | 'names';
export type Instrument = 'piano' | 'sax' | 'names';

export interface SettingsState {
	presentationModes: { [cardType: string]: PresentationModeIds };
	chordInputMode?: ChordInputMode;
	showSaxFingerings?: boolean;
	instrument?: Instrument;
	saxType?: SaxType;
	saxHoldMs?: number;
	saxToneMode?: ToneMode;
	saxToneMs?: number;
	saxAnyOctave?: boolean;
	rhythmLatencyMs?: number;
	saxRhythmLatencyMs?: number;
	midiActionKeys?: Partial<MidiActionKeys>;
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
		setSaxHoldMs(state, action: PayloadAction<number>) {
			state.saxHoldMs = action.payload;
		},
		setSaxToneMode(state, action: PayloadAction<ToneMode>) {
			state.saxToneMode = action.payload;
		},
		setSaxToneMs(state, action: PayloadAction<number>) {
			state.saxToneMs = action.payload;
		},
		setSaxAnyOctave(state, action: PayloadAction<boolean>) {
			state.saxAnyOctave = action.payload;
		},
		setRhythmLatencyMs(state, action: PayloadAction<number>) {
			state.rhythmLatencyMs = action.payload;
		},
		setSaxRhythmLatencyMs(state, action: PayloadAction<number>) {
			state.saxRhythmLatencyMs = action.payload;
		},
		setMidiActionKey(
			state,
			{ payload }: PayloadAction<{ action: MidiActionKey; note: number | null }>,
		) {
			const keys = { ...DEFAULT_MIDI_ACTION_KEYS, ...state.midiActionKeys };
			for (const action of MIDI_ACTIONS)
				if (keys[action] === payload.note) keys[action] = null;
			keys[payload.action] = payload.note;
			state.midiActionKeys = keys;
		},
	},
});

export const settingsReducer = settingsSlice.reducer;
export const settingsActions = settingsSlice.actions;
