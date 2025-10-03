import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Midi, note, Note } from 'tonal';

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
	waitingUntilEmpty: boolean;
	waitingUntilEmptyNotes: MidiNote[];
	availableMidiDevices: MidiInput[];
	selectedInput?: string;
	selectedOutput?: string;
	pianoSamplesEnabled: boolean;
}

const initialState: MidiReduxState = {
	notes: [],
	wrongNotes: [],
	waitingUntilEmpty: false,
	waitingUntilEmptyNotes: [],
	availableMidiDevices: [],
	pianoSamplesEnabled: false,
};

const midiSlice = createSlice({
	name: 'midi',
	initialState,
	reducers: {
		addNote(state, action: PayloadAction<number | MidiNote>) {
			const note: MidiNote =
				typeof action.payload === 'number' ? { number: action.payload } : action.payload;
			const existingNote = state.notes.find((n) => n.number === note.number);
			if (!existingNote) {
				// UnExactMultiAnswerValidator depends on this sorting
				state.notes = [...state.notes, note].sort((a, b) => a.number - b.number);
			}

			console.log(
				'[midiSlice][addNote] ',
				state.notes.map((n) => `${Midi.midiToNoteName(n.number)}`).join(', '),
				`(${state.notes.map((n) => n.number).join(', ')})`,
			);
		},
		removeNote(state, action: PayloadAction<number>) {
			state.notes = state.notes.filter((note) => note.number !== action.payload);
			state.wrongNotes = state.wrongNotes.filter((note) => note !== action.payload);
			state.waitingUntilEmptyNotes = state.waitingUntilEmptyNotes.filter(
				(note) => note.number !== action.payload,
			);
			if (state.waitingUntilEmpty && state.waitingUntilEmptyNotes.length === 0) {
				state.waitingUntilEmpty = false;
			}

			console.log(
				'[midiSlice][removeNote] ',
				state.notes.map((n) => `${Midi.midiToNoteName(n.number)}`).join(', '),
				`(${state.notes.map((n) => n.number).join(', ')})`,
			);
		},
		addWrongNote(state, action: PayloadAction<number>) {
			const existingNote = state.wrongNotes.find((note) => note === action.payload);
			if (!existingNote) {
				state.wrongNotes = [...state.wrongNotes, action.payload];
			}
		},
		clearDevices(state) {
			state.availableMidiDevices = [];
		},
		addDevice(state, action: PayloadAction<MidiInput>) {
			const existingDevice = state.availableMidiDevices.find(
				(input) => input.id === action.payload.id,
			);
			if (!existingDevice) {
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
				(input) => input.id !== action.payload,
			);
		},
		setSelectedInput(state, action: PayloadAction<string>) {
			state.selectedInput = action.payload;
		},
		setSelectedOutput(state, action: PayloadAction<string>) {
			state.selectedOutput = action.payload;
		},
		setPianoSamplesEnabled(state, action: PayloadAction<boolean>) {
			state.pianoSamplesEnabled = action.payload;
		},
		waitUntilEmpty(state) {
			state.waitingUntilEmpty = true;
			state.waitingUntilEmptyNotes = state.notes;
		},

		// ok the thing with the click keyboard is
		// you want to clear clicked notes after key press is UP
		// that's when you want to remove
		// unforntunately, waitUntilEmpty must also be called when a wrong note appears
		// but we don't clear clicked

		/*
		clearClickedNotes(state) {
			state.wrongNotes = state.wrongNotes.filter(
				(wn) => !state.notes.find((n) => n.number === wn)?.clicked,
			);
			state.notes = state.notes.filter((note) => !note.clicked);
			// if (state.notes.length === 0 && state.waitingUntilEmpty) {
			// 	state.waitingUntilEmpty = false;
			// }
		},
		*/
	},
});

export const midiReducer = midiSlice.reducer;
export const midiActions = midiSlice.actions;
