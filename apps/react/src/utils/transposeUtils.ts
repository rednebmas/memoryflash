import { MultiSheetQuestion } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { majorKeys } from 'MemoryFlashCore/src/lib/notes';
import { Midi, Chord, Note } from 'tonal';

// All 12 keys for transposition (C and equivalents removed since they're the original)
export const TRANSPOSITION_KEYS = majorKeys.filter(key => key !== 'C');

/**
 * Calculates the semitone difference between two keys
 * @param sourceKey Source key (e.g., 'C', 'F#')
 * @param targetKey Target key (e.g., 'G', 'Bb')
 * @returns Number of semitones to transpose
 */
export const getSemitonesBetweenKeys = (sourceKey: string, targetKey: string): number => {
  // Get the tonic notes without octave
  const sourceRoot = Chord.get(sourceKey).tonic || 'C';
  const targetRoot = Chord.get(targetKey).tonic || 'C';
  
  // Convert to MIDI numbers (assuming octave 4)
  const sourceMidi = Midi.toMidi(`${sourceRoot}4`) || 60;
  const targetMidi = Midi.toMidi(`${targetRoot}4`) || 60;
  
  // Calculate difference
  return targetMidi - sourceMidi;
};

/**
 * Transposes a piece of music to all 12 keys
 * @param music Original music notation data
 * @param originalKey The key signature of the original music
 * @returns Array of MultiSheetQuestion objects for each key
 */
export const transposeToAllKeys = (music: MultiSheetQuestion, originalKey: string): MultiSheetQuestion[] => {
  if (!music.voices.length) return [];
  
  return TRANSPOSITION_KEYS.map(targetKey => {
    // Clone the music object
    const transposed: MultiSheetQuestion = {
      ...music,
      key: targetKey,
      voices: music.voices.map(voice => ({
        ...voice,
        stack: voice.stack.map(stack => ({
          ...stack,
          notes: stack.notes.map(note => {
            const fullNote = `${note.name}${note.octave}`;
            const midiNum = Midi.toMidi(fullNote);
            
            if (midiNum === null) return note; // Return original if conversion fails
            
            // Calculate interval between original key and target key
            const semitones = getSemitonesBetweenKeys(originalKey, targetKey);
            
            // Transpose the note by the interval
            const transposedMidi = midiNum + semitones;
            
            // Convert back to note name in the target key
            const transposedNote = Note.fromMidi(transposedMidi);
            const noteParts = transposedNote.match(/([A-G][b#]*)(\d+)/);
            
            if (!noteParts) return note; // Return original if parsing fails
            
            return {
              name: noteParts[1],
              octave: parseInt(noteParts[2])
            };
          })
        }))
      }))
    };
    
    return transposed;
  });
};