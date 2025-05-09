import { Note as VFNote, Stave } from 'vexflow';
import { MultiSheetQuestion } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { Chord } from 'tonal';
import { VF, beatMap, BeatMap } from './utils';

// Create a spacer note for empty chord measures
const createEmptyChordSpacer = (stave: Stave): VFNote => {
  const spacerNote = new VF.TextNote({
    text: '', // Empty text
    font: { family: 'FreeSerif' },
    duration: 'w', // Whole note duration
  })
    .setJustification(VF.TextNote.Justification.CENTER)
    .setLine(-1)
    .setStave(stave);
    
  return spacerNote;
};

// Helper to get note duration in beats
const getNoteDurationInBeats = (note: VFNote): number => {
  // Access the duration using the appropriate accessor method if available
  // or use a type assertion to access the protected property
  const duration = (note as unknown as { duration: string }).duration || 'q';
  return beatMap[duration as keyof BeatMap] || 0;
};

// Helper to get total beats in a measure
const calculateTotalBeats = (notes: VFNote[]): number => {
  return notes.reduce((sum, note) => sum + getNoteDurationInBeats(note), 0);
};

// Helper to ensure a measure has exactly 4 beats
const ensureCompleteMeasure = (notes: VFNote[], stave: Stave): VFNote[] => {
  const totalBeats = calculateTotalBeats(notes);
  
  // If measure is empty or has incorrect beat count, replace with a whole note spacer
  if (notes.length === 0 || totalBeats !== 4) {
    return [createEmptyChordSpacer(stave)];
  }
  
  return notes;
};

// Create text notes for chords
export const createChordTextNotes = (
  data: MultiSheetQuestion,
  topStaves: Stave[],
): VFNote[] => {
  return data.voices[0].stack
    .map((stackedNotes) => {
      // Only create text notes for notes with chord names
      if (!stackedNotes.chordName) {
        return null; // Skip notes without chord names
      }
      
      const chord = Chord.get(stackedNotes.chordName);
      if (!chord.tonic) return null;

      let text: string = chord.tonic.replace('b', '♭').replace('#', '♯');
      let superscript: string = '';
      switch (chord.type) {
        case 'minor seventh':
          text += 'm';
          superscript = '7';
          break;
        case 'dominant seventh':
          superscript = '7';
          break;
        case 'major seventh':
          superscript = '∆7';
          break;
        default:
          text = chord.symbol;
          break;
      }

      // Create the text note with a reference to the first stave (will update later)
      const textNote = new VF.TextNote({
        text,
        superscript,
        font: { family: 'FreeSerif' },
        duration: stackedNotes.duration,
      })
        .setJustification(VF.TextNote.Justification.CENTER)
        .setLine(-1)
        .setStave(topStaves[0]); // Default to first stave, will update later
        
      return textNote;
    })
    .filter(Boolean) as VFNote[]; // Remove null entries
};

// Organize chord notes into measures
export const organizeChordsByMeasure = (
  textNotes: VFNote[],
  topStaves: Stave[],
  measuresCount: number
): VFNote[][] => {
  // Initialize array to hold notes for each measure
  let allMeasureTextNotes: VFNote[][] = Array(measuresCount).fill(0).map(() => []);
  
  // If there are no chord notes, add a spacer to each measure
  if (textNotes.length === 0) {
    for (let i = 0; i < measuresCount; i++) {
      allMeasureTextNotes[i].push(createEmptyChordSpacer(topStaves[i]));
    }
    return allMeasureTextNotes;
  }
  
  // Distribute notes across measures
  let currentBeats = 0;
  let currentMeasureIndex = 0;
  
  for (const textNote of textNotes) {
    const noteDuration = getNoteDurationInBeats(textNote);
    
    // Start a new measure if adding this note would exceed 4 beats
    if (currentBeats + noteDuration > 4) {
      // Complete current measure with a spacer if needed
      if (currentBeats < 4) {
        allMeasureTextNotes[currentMeasureIndex].push(createEmptyChordSpacer(topStaves[currentMeasureIndex]));
      }
      
      // Move to next measure
      currentMeasureIndex++;
      currentBeats = 0;
      
      // Stop if we've reached the end of available measures
      if (currentMeasureIndex >= measuresCount) break;
    }
    
    // Update stave reference and add to current measure
    textNote.setStave(topStaves[currentMeasureIndex]);
    allMeasureTextNotes[currentMeasureIndex].push(textNote);
    currentBeats += noteDuration;
  }
  
  // Complete the last measure if it's not full
  if (currentBeats > 0 && currentBeats < 4 && currentMeasureIndex < measuresCount) {
    allMeasureTextNotes[currentMeasureIndex].push(createEmptyChordSpacer(topStaves[currentMeasureIndex]));
  }
  
  // Ensure all measures have at least one note
  for (let i = 0; i < measuresCount; i++) {
    if (allMeasureTextNotes[i].length === 0) {
      allMeasureTextNotes[i].push(createEmptyChordSpacer(topStaves[i]));
    }
  }
  
  return allMeasureTextNotes;
};

// Render chord notation
export const renderChordNotation = (
  allMeasureTextNotes: VFNote[][],
  topStaves: Stave[],
  formatter: any,
  context: any
): void => {
  // Process each measure
  allMeasureTextNotes.forEach((measureNotes, measureIndex) => {
    if (measureNotes.length === 0) return;
    
    // Ensure the measure has exactly 4 beats
    const validMeasureNotes = ensureCompleteMeasure(measureNotes, topStaves[measureIndex]);
    
    // Create voice and add notes
    const textVoice = new VF.Voice({ num_beats: 4, beat_value: 4 })
      .addTickables(validMeasureNotes);
      
    // Format and draw
    formatter.joinVoices([textVoice]);
    formatter.formatToStave([textVoice], topStaves[measureIndex]);
    textVoice.draw(context, topStaves[measureIndex]);
  });
}; 