import { Note as VFNote, Stave } from 'vexflow';
import { Voice, StackedNotes } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { VF, beatMap, BeatMap, getRestPosition } from './utils';

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
  
  voice.stack.forEach((stackedNote, i) => {
    const noteDuration = beatMap[stackedNote.duration as keyof BeatMap] || 0;
    
    // If adding this note would exceed 4 beats, move to next measure
    if (currentBeats + noteDuration > 4) {
      currentMeasureIndex++;
      currentBeats = 0;
    }
    
    // Ensure we don't exceed the measure count
    if (currentMeasureIndex >= measuresCount) {
      currentMeasureIndex = measuresCount - 1;
    }
    
    // Get the current stave
    const stave = staves[currentMeasureIndex];
    
    // Create the note
    let keys;
    if (stackedNote.isRest) {
      // For rests, use standard positioning based on duration and clef
      const restPosition = getRestPosition(stackedNote.duration, stave.getClef());
      keys = [restPosition];
    } else {
      // For regular notes, use the provided pitch
      keys = stackedNote.notes.map((note) => 
        `${note.name}/${note.octave + (_8va ? 0 : 0)}`
      );
    }
    
    const staveNote = new VF.StaveNote({
      keys,
      duration: stackedNote.isRest ? stackedNote.duration + 'r' : stackedNote.duration,
      clef: stave.getClef(),
      auto_stem: true,
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
    currentBeats += noteDuration;
  });
  
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