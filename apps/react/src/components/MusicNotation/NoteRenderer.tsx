import { Note as VFNote, Stave } from 'vexflow';
import { Voice, StackedNotes } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { VF, beatMap, BeatMap, getRestPosition } from './utils';

// Create a rest note for an empty measure
const createRestForEmptyMeasure = (stave: Stave): VFNote => {
  const restPosition = getRestPosition('w', stave.getClef());
  const restNote = new VF.StaveNote({
    keys: [restPosition],
    duration: 'wr', // Whole rest
    clef: stave.getClef(),
    auto_stem: false, // disable stem calculation for rests
  });
  restNote.setStave(stave);
  return restNote;
};

// Create notes for each measure
export const createMeasureNotes = (
  voice: Voice, 
  staves: Stave[], 
  measuresCount: number,
  allNotesClassName: string | undefined,
  highlightClassName: string | undefined,
  multiPartCardIndex: number,
  _8va: boolean = false
): VFNote[][] => {
  let currentBeats = 0;
  let currentMeasureIndex = 0;
  let allMeasureNotes: VFNote[][] = Array(measuresCount).fill(0).map(() => []);
  
  // Loop through the stack, but only process notes that will fit within our measure count
  for (let i = 0; i < voice.stack.length; i++) {
    const stackedNote = voice.stack[i];
    const noteDuration = beatMap[stackedNote.duration as keyof BeatMap] || 0;
    
    // If adding this note would exceed 4 beats, move to next measure
    if (currentBeats + noteDuration > 4) {
      currentMeasureIndex++;
      currentBeats = 0;
    }
    
    // If we've exceeded our measure count, stop processing notes
    if (currentMeasureIndex >= measuresCount) {
      break; // Stop processing more notes
    }
    
    // Get the current stave
    const stave = staves[currentMeasureIndex];
    
    // Create the note
    let keys;
    // Treat explicit rests or empty note arrays as rests
    if (stackedNote.isRest || stackedNote.notes.length === 0) {
      // For rests, use standard positioning based on duration and clef
      const restPosition = getRestPosition(stackedNote.duration, stave.getClef());
      keys = [restPosition];
      
      // Create a rest note
      const staveNote = new VF.StaveNote({
        keys,
        duration: stackedNote.duration + 'r', // Add 'r' suffix for rests
        clef: stave.getClef(),
        auto_stem: false, // Disable for rests as they don't need stems
      });
      staveNote.setStave(stave);
      
      if (allNotesClassName) {
        staveNote.addClass(allNotesClassName);
      }
      if (i < multiPartCardIndex && highlightClassName) {
        staveNote.addClass(highlightClassName);
      }
      
      // Add rest to the appropriate measure's notes
      allMeasureNotes[currentMeasureIndex].push(staveNote);
    } else {
      // For regular notes, use the provided pitch
      keys = stackedNote.notes.map((note) => 
        `${note.name}/${note.octave + (_8va ? 0 : 0)}`
      );
      
      // Create a regular note
      const staveNote = new VF.StaveNote({
        keys,
        duration: stackedNote.duration,
        clef: stave.getClef(),
        auto_stem: true, // Regular notes should have auto-stemming
      });
      staveNote.setStave(stave);
      
      if (allNotesClassName) {
        staveNote.addClass(allNotesClassName);
      }
      if (i < multiPartCardIndex && highlightClassName) {
        staveNote.addClass(highlightClassName);
      }
      
      // Add note to the appropriate measure's notes
      allMeasureNotes[currentMeasureIndex].push(staveNote);
    }
    
    currentBeats += noteDuration;
  }
  
  // Ensure all measures have at least one note
  for (let i = 0; i < measuresCount; i++) {
    if (allMeasureNotes[i].length === 0) {
      // Add a whole rest for empty measures
      allMeasureNotes[i].push(createRestForEmptyMeasure(staves[i]));
    }
  }
  
  return allMeasureNotes;
};

// Render the notes for each measure
export const renderNotes = (
  allMeasureNotes: VFNote[][],
  staves: Stave[],
  formatter: any,
  context: any,
  key: string
): void => {
  // Create a VexFlow Voice for each measure and render it
  allMeasureNotes.forEach((measureNotes, measureIndex) => {
    if (measureNotes.length === 0) return;
    
    const vfVoice = new VF.Voice({ num_beats: 4, beat_value: 4 })
      .addTickables(measureNotes);
      
    VF.Accidental.applyAccidentals([vfVoice], key);
    
    // Format and draw the notes for this measure
    formatter.joinVoices([vfVoice]);
    formatter.formatToStave([vfVoice], staves[measureIndex]);
    vfVoice.draw(context, staves[measureIndex]);
  });
}; 