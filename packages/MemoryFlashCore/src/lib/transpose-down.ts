import { Interval, Note } from 'tonal';

// Function to transpose a note down by an interval
export function transposeDown(note: string, interval: string): string {
	const semitones = Interval.semitones(interval);
	if (!semitones) return ''; // Invalid interval

	// Get the MIDI number for the note
	const midi = Note.midi(note);
	if (!midi) return ''; // Invalid note

	// Calculate the new MIDI number and convert it back to a note name
	const newMidi = midi - semitones;
	const newNote = Note.fromMidi(newMidi);
	return newNote;
}
