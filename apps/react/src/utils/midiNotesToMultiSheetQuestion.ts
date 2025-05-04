import { Midi, Note, Key } from 'tonal';
import { MultiSheetQuestion, Voice } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { StaffEnum } from 'MemoryFlashCore/src/types/Cards';

type MidiNote = {
	number: number;
	clicked?: boolean;
};

/**
 * Convert a MIDI note number to its name in the context of a given key.
 *
 * @param midi   MIDI note number (0–127)
 * @param key    e.g. "C", "Eb", "F#", etc.
 * @returns      e.g. "Eb4" or "C#4"
 */
function namedInKey(midi: number, key: string): string {
  const keyInfo = Key.majorKey(key);
  const useSharps = keyInfo.scale.some(n => n.includes("#"));
  return useSharps
    ? Note.fromMidiSharps(midi)
    : Note.fromMidi(midi);
}

export const midiNotesToMultiSheetQuestion = (
	midiNotes: MidiNote[],
	middleNote: number = 60, // Middle C (C4) by default
	key: string = 'C',
): MultiSheetQuestion => {
	// Convert MIDI note numbers to note names
	const notesWithInfo = midiNotes.map((note) => {
		const noteName = namedInKey(note.number, key);
		// Extract note name (without octave) and octave
		const { letter, acc, oct } = Note.get(noteName);
		const name = `${letter}${acc || ''}`;
		return {
			number: note.number,
			name,
			octave: parseInt(oct || '4'),
		};
	});

	// Split notes between treble and bass clef based on the middleNote
	const trebleNotes = notesWithInfo.filter((note) => note.number >= middleNote);
	const bassNotes = notesWithInfo.filter((note) => note.number < middleNote);

	// Create voice objects for treble and bass
	const voices: Voice[] = [];

	if (trebleNotes.length > 0) {
		voices.push({
			staff: StaffEnum.Treble,
			stack: [
				{
					duration: 'w',
					notes: trebleNotes,
				},
			],
		});
	}

	if (bassNotes.length > 0) {
		voices.push({
			staff: StaffEnum.Bass,
			stack: [
				{
					duration: 'w',
					notes: bassNotes,
				},
			],
		});
	}

	// Create MultiSheetQuestion object
	return {
		voices,
		key,
		_8va: false,
	};
};
