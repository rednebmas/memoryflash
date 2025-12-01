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
	pendingClearClickedNotes: boolean;
}

const initialState: MidiReduxState = {
	notes: [],
	wrongNotes: [],
	waitingUntilEmpty: false,
	waitingUntilEmptyNotes: [],
	availableMidiDevices: [],
	pendingClearClickedNotes: false,
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
			const wasWrongNote = state.wrongNotes.includes(action.payload);
			const wasClicked = state.notes.find((n) => n.number === action.payload)?.clicked;
			state.notes = state.notes.filter((note) => note.number !== action.payload);
			state.wrongNotes = state.wrongNotes.filter((note) => note !== action.payload);
			state.waitingUntilEmptyNotes = state.waitingUntilEmptyNotes.filter(
				(note) => note.number !== action.payload,
			);

			// If pending clear and a clicked note was released, clear all clicked notes
			if (state.pendingClearClickedNotes && wasClicked) {
				const clickedNotes = state.notes.filter((note) => note.clicked);
				state.wrongNotes = state.wrongNotes.filter(
					(wn) => !clickedNotes.find((n) => n.number === wn),
				);
				state.notes = state.notes.filter((note) => !note.clicked);
				state.waitingUntilEmptyNotes = state.waitingUntilEmptyNotes.filter(
					(note) => !note.clicked,
				);
				state.pendingClearClickedNotes = false;
			}

			// Clear waiting if no notes left, OR if we just removed a wrong note and no wrong notes remain
			if (
				state.waitingUntilEmpty &&
				(state.waitingUntilEmptyNotes.length === 0 ||
					(wasWrongNote && state.wrongNotes.length === 0))
			) {
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
		waitUntilEmpty(state) {
			if (state.notes.length === 0) {
				state.waitingUntilEmpty = false;
				state.waitingUntilEmptyNotes = [];
			} else {
				state.waitingUntilEmpty = true;
				state.waitingUntilEmptyNotes = state.notes;
			}
		},
		clearClickedNotes(state) {
			const clickedNotes = state.notes.filter((note) => note.clicked);
			state.wrongNotes = state.wrongNotes.filter(
				(wn) => !clickedNotes.find((n) => n.number === wn),
			);
			state.notes = state.notes.filter((note) => !note.clicked);
			state.waitingUntilEmptyNotes = state.waitingUntilEmptyNotes.filter(
				(note) => !note.clicked,
			);
			if (state.waitingUntilEmpty && state.waitingUntilEmptyNotes.length === 0) {
				state.waitingUntilEmpty = false;
			}
			state.pendingClearClickedNotes = false;
		},
		requestClearClickedNotes(state) {
			// Set flag to clear clicked notes on next mouse up
			// This allows the user to see the correct notes before they disappear
			state.pendingClearClickedNotes = true;
		},
	},
});

export const midiReducer = midiSlice.reducer;
export const midiActions = midiSlice.actions;
