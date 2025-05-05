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
  let currentBeats = 0;
  let currentMeasureIndex = 0;
  let allMeasureTextNotes: VFNote[][] = Array(measuresCount).fill(0).map(() => []);
  
  // If there are no chord notes, still need to create at least one empty note per measure
  if (textNotes.length === 0) {
    for (let i = 0; i < measuresCount; i++) {
      allMeasureTextNotes[i].push(createEmptyChordSpacer(topStaves[i]));
    }
    return allMeasureTextNotes;
  }
  
  // Split the text notes into measures
  for (let i = 0; i < textNotes.length; i++) {
    const textNote = textNotes[i];
    
    // Access the duration without using the protected property directly
    // Use type assertion to access internal properties safely
    const textNoteObj = textNote as any;
    const duration = textNoteObj.duration || 'q'; // Default to quarter note
    const noteDuration = beatMap[duration as keyof BeatMap] || 0;
    
    // If adding this note would exceed 4 beats, move to next measure
    if (currentBeats + noteDuration > 4) {
      currentMeasureIndex++;
      currentBeats = 0;
    }
    
    // If we've exceeded our measure count, stop processing notes
    if (currentMeasureIndex >= measuresCount) {
      break; // Stop processing more notes
    }
    
    // Update the stave for this text note to the appropriate measure's stave
    textNote.setStave(topStaves[currentMeasureIndex]);
    
    // Add to the appropriate measure's notes
    allMeasureTextNotes[currentMeasureIndex].push(textNote);
    currentBeats += noteDuration;
  }
  
  // Ensure all measures have at least one note
  for (let i = 0; i < measuresCount; i++) {
    if (allMeasureTextNotes[i].length === 0) {
      // Add an empty spacer for measures without chord notes
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
  // Create and draw voices for chord text notes, one for each measure
  allMeasureTextNotes.forEach((measureNotes, measureIndex) => {
    if (measureNotes.length === 0) return;
    
    const textVoice = new VF.Voice({ num_beats: 4, beat_value: 4 })
      .addTickables(measureNotes);
      
    // Format and draw
    formatter.joinVoices([textVoice]);
    formatter.formatToStave([textVoice], topStaves[measureIndex]);
    textVoice.draw(context, topStaves[measureIndex]);
  });
}; 