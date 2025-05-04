import { Midi } from 'tonal';
import { namedInKey } from './midiNotesToMultiSheetQuestion';
import {
	MultiSheetQuestion,
	Voice,
	StackedNotes,
	SheetNote,
	Duration,
} from 'MemoryFlashCore/src/types/MultiSheetCard';
import { StaffEnum } from 'MemoryFlashCore/src/types/Cards';
import { MidiNote } from 'MemoryFlashCore/src/redux/slices/midiSlice';

function getDurationInBeats(d: string): number {
	switch (d) {
		case 'w':
			return 4;
		case 'h':
			return 2;
		case 'q':
			return 1;
		case '8':
			return 0.5;
		case '16':
			return 0.25;
		default:
			return 2;
	}
}

function ensureCompleteMeasure(stacks: StackedNotes[], measuresCount: number): StackedNotes[] {
	// First, calculate how many beats we have
	const recordedBeats = stacks.reduce((sum, s) => sum + getDurationInBeats(s.duration), 0);
	const targetBeats = measuresCount * 4; // Each measure should have exactly 4 beats
	
	// Create a new array to hold balanced measures
	let result: StackedNotes[] = [];
	
	// Group notes into complete 4-beat measures
	let currentMeasureBeats = 0;
	let currentMeasureNotes: StackedNotes[] = [];
	
	// Process each note
	for (const note of stacks) {
		const noteDuration = getDurationInBeats(note.duration);
		
		// If adding this note would exceed 4 beats, we need to split it or start a new measure
		if (currentMeasureBeats + noteDuration > 4) {
			// If we have some notes in the current measure, add appropriate rests to complete it
			if (currentMeasureBeats < 4 && currentMeasureBeats > 0) {
				const remainingBeats = 4 - currentMeasureBeats;
				currentMeasureNotes.push(createRest(remainingBeats));
			}
			
			// Add the completed measure to the result
			result = [...result, ...currentMeasureNotes];
			
			// Start a new measure
			currentMeasureBeats = 0;
			currentMeasureNotes = [];
		}
		
		// Add the note to the current measure
		currentMeasureNotes.push(note);
		currentMeasureBeats += noteDuration;
		
		// If we exactly completed a measure, add it to the result and start a new one
		if (currentMeasureBeats === 4) {
			result = [...result, ...currentMeasureNotes];
			currentMeasureBeats = 0;
			currentMeasureNotes = [];
		}
	}
	
	// If we have notes left in an incomplete measure, add rests to complete it
	if (currentMeasureBeats > 0) {
		const remainingBeats = 4 - currentMeasureBeats;
		currentMeasureNotes.push(createRest(remainingBeats));
		result = [...result, ...currentMeasureNotes];
	}
	
	// Now ensure we have exactly the requested number of measures by adding full-measure rests if needed
	const completedMeasures = Math.ceil(result.length / 4);
	if (completedMeasures < measuresCount) {
		const measuresToAdd = measuresCount - completedMeasures;
		for (let i = 0; i < measuresToAdd; i++) {
			// Add a whole-note rest (4 beats)
			result.push(createRest(4));
		}
	}
	
	return result;
}

// Helper function to create a rest with the appropriate duration
function createRest(beats: number): StackedNotes {
	let restDuration: Duration;
	
	if (beats >= 4) {
		restDuration = 'w';
	} else if (beats >= 2) {
		restDuration = 'h';
	} else if (beats >= 1) {
		restDuration = 'q';
	} else if (beats >= 0.5) {
		restDuration = '8';
	} else {
		restDuration = '16';
	}
	
	return {
		notes: [{ name: 'b', octave: 4, isRest: true }],
		duration: restDuration,
		isRest: true
	};
}

export class MusicRecorder {
	private key: string;
	private middleNote: number;
	private measuresCount: number;
	private noteDuration: Duration;
	private stacks: StackedNotes[] = [];
	private position = 0;

	constructor(key = 'C', middleNote = 60, measuresCount = 1, noteDuration: Duration = 'h') {
		this.key = key;
		this.middleNote = middleNote;
		this.measuresCount = measuresCount;
		this.noteDuration = noteDuration;
		this.reset();
	}

	private getNotesPerMeasure(): number {
		switch (this.noteDuration) {
			case 'w':
				return 1;
			case 'h':
				return 2;
			case 'q':
				return 4;
			case '8':
				return 8;
			case '16':
				return 16;
			default:
				return 2;
		}
	}

	private initializeStacks() {
		const totalSlots = this.getNotesPerMeasure() * this.measuresCount;
		this.stacks = Array.from({ length: totalSlots }, () => ({
			notes: [{ name: 'b', octave: 4, isRest: true }],
			duration: this.noteDuration as Duration,
			isRest: true
		}));
		this.position = 0;
	}

	private parseMidiNotes(input: MidiNote[]): SheetNote[] {
		return input.map(({ number }) => {
			const full = namedInKey(number, this.key);
			const m = full.match(/([A-G][b#]*)(\d+)/);
			if (!m) throw new Error(`Invalid note: ${full}`);
			return { name: m[1], octave: parseInt(m[2], 10) };
		});
	}

	recordNotes(input: MidiNote[]): boolean {
		if (this.position >= this.stacks.length) return false;
		const notes = this.parseMidiNotes(input);
		this.stacks[this.position++] = { notes, duration: this.noteDuration };
		return true;
	}

	getState() {
		return {
			currentPosition: this.position,
			totalPositions: this.stacks.length,
			isComplete: this.position >= this.stacks.length,
		};
	}

	reset() {
		this.initializeStacks();
	}

	updateSettings(opts: {
		key?: string;
		middleNote?: number;
		measuresCount?: number;
		noteDuration?: Duration;
	}) {
		if (opts.key !== undefined) this.key = opts.key;
		if (opts.middleNote !== undefined) this.middleNote = opts.middleNote;
		if (opts.measuresCount !== undefined) this.measuresCount = opts.measuresCount;
		if (opts.noteDuration !== undefined) this.noteDuration = opts.noteDuration;
		this.reset();
	}

	private splitForStaves(stacks: StackedNotes[]) {
		const treble: StackedNotes[] = [];
		const bass: StackedNotes[] = [];
		let hasTreble = false;
		let hasBass = false;

		for (const { notes, duration } of stacks) {
			const t = notes.filter((n) => {
				const v = Midi.toMidi(`${n.name}${n.octave}`);
				return v !== null && v >= this.middleNote;
			});
			const b = notes.filter((n) => {
				const v = Midi.toMidi(`${n.name}${n.octave}`);
				return v !== null && v < this.middleNote;
			});
			if (t.length) hasTreble = true;
			if (b.length) hasBass = true;
			treble.push({ notes: t, duration });
			bass.push({ notes: b, duration });
		}

		return { treble, bass, hasTreble, hasBass };
	}

	toMultiSheetQuestion(): MultiSheetQuestion {
		const recorded = this.stacks.slice(0, this.position);
		const { treble, bass, hasTreble, hasBass } = this.splitForStaves(recorded);
		const voices: Voice[] = [];

		if (hasTreble)
			voices.push({
				staff: StaffEnum.Treble,
				stack: ensureCompleteMeasure(treble, this.measuresCount),
			});

		if (hasBass)
			voices.push({
				staff: StaffEnum.Bass,
				stack: ensureCompleteMeasure(bass, this.measuresCount),
			});

		if (!voices.length && recorded.length) {
			voices.push({
				staff: StaffEnum.Treble,
				stack: ensureCompleteMeasure([], this.measuresCount),
			});
		}

		return { voices, key: this.key, _8va: false };
	}
}
