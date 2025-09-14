import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Midi } from 'tonal';

type MidiInput = {
	id: string;
	name: string;
	type: 'input' | 'output';
};

type MidiNote = {
	number: number;
	clicked?: boolean;
};

export interface MidiReduxState {
	notes: MidiNote[];
	wrongNotes: number[];
	availableMidiDevices: MidiInput[];
	selectedInput?: string;
	selectedOutput?: string;
}

const initialState: MidiReduxState = {
	notes: [],
	wrongNotes: [],
	availableMidiDevices: [],
};

const midiSlice = createSlice({
	name: 'midi',
	initialState,
	reducers: {
		addNote(state, action: PayloadAction<number | MidiNote>) {
			const note =
				typeof action.payload === 'number' ? { number: action.payload } : action.payload;
			const existing = state.notes.find((n) => n.number === note.number);
			if (!existing) {
				state.notes = [...state.notes, note].sort((a, b) => a.number - b.number);
			}
			console.log(
				'[midiSlice][addNote] ',
				state.notes.map((n) => `${Midi.midiToNoteName(n.number)}`).join(', '),
				`(${state.notes.map((n) => n.number).join(', ')})`,
			);
		},
		removeNote(state, action: PayloadAction<number>) {
			state.notes = state.notes.filter((n) => n.number !== action.payload);
			state.wrongNotes = state.wrongNotes.filter((n) => n !== action.payload);
			console.log(
				'[midiSlice][removeNote] ',
				state.notes.map((n) => `${Midi.midiToNoteName(n.number)}`).join(', '),
				`(${state.notes.map((n) => n.number).join(', ')})`,
			);
		},
		addWrongNote(state, action: PayloadAction<number>) {
			const exists = state.wrongNotes.find((n) => n === action.payload);
			if (!exists) {
				state.wrongNotes = [...state.wrongNotes, action.payload];
			}
		},
		clearDevices(state) {
			state.availableMidiDevices = [];
		},
		addDevice(state, action: PayloadAction<MidiInput>) {
			const existing = state.availableMidiDevices.find((d) => d.id === action.payload.id);
			if (!existing) {
				state.availableMidiDevices = [...state.availableMidiDevices, action.payload];
			}
			if (action.payload.type === 'input' && !state.selectedInput) {
				state.selectedInput = action.payload.id;
			}
			if (action.payload.type === 'output' && !state.selectedOutput) {
				state.selectedOutput = action.payload.id;
			}
		},
		removeDevice(state, action: PayloadAction<string>) {
			state.availableMidiDevices = state.availableMidiDevices.filter(
				(d) => d.id !== action.payload,
			);
		},
		setSelectedInput(state, action: PayloadAction<string>) {
			state.selectedInput = action.payload;
		},
		setSelectedOutput(state, action: PayloadAction<string>) {
			state.selectedOutput = action.payload;
		},
	},
});

export const midiReducer = midiSlice.reducer;
export const midiActions = midiSlice.actions;
