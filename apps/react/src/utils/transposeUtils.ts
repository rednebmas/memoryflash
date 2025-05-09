import { MultiSheetQuestion, SheetNote } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { majorKeys } from 'MemoryFlashCore/src/lib/notes';
import { Midi, Chord, Note, Scale, Interval, Key } from 'tonal';

// All 12 keys for transposition (C and equivalents removed since they're the original)
export const TRANSPOSITION_KEYS = majorKeys.filter(key => key !== 'C');

export const getEnharmonicPreferenceForTargetKey = (targetKey: string): boolean | undefined => {
  const keySignatureInfo = Key.majorKey(targetKey);
  if (keySignatureInfo) {
    if (keySignatureInfo.alteration > 0) {
      return true; 
    } else if (keySignatureInfo.alteration < 0) {
      return false; 
    }
  }
  return undefined; 
};

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
    const transposed: MultiSheetQuestion = {
      ...music,
      key: targetKey,
      voices: music.voices.map(voice => ({
        ...voice,
        stack: voice.stack.map(stack => ({
          ...stack,
          notes: stack.notes.map((n): SheetNote => {
            const originalFullName = `${n.name}${n.octave}`;
            const midiNum = Midi.toMidi(originalFullName);

            if (midiNum === null) return n;

            const semitones = getSemitonesBetweenKeys(originalKey, targetKey);
            const transposedMidi = midiNum + semitones;
            
            const useSharps = getEnharmonicPreferenceForTargetKey(targetKey);

            const transposedNoteNameFull = Midi.midiToNoteName(transposedMidi, { sharps: useSharps });
            const transposedNoteDetails = Note.get(transposedNoteNameFull);

            return {
              name: transposedNoteDetails.pc || Note.pitchClass(transposedNoteNameFull), // Fallback for pc
              octave: transposedNoteDetails.oct ?? 4, 
            };
          })
        }))
      }))
    };
    
    return transposed;
  });
};