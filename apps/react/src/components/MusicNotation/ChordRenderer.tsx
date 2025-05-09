import { Note as VFNote, Stave } from 'vexflow';
import { MultiSheetQuestion } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { Chord } from 'tonal';
import { VF, beatMap, BeatMap } from './utils';

const createEmptyChordSpacer = (stave: Stave): VFNote => {
  const spacerNote = new VF.TextNote({
    text: '', 
    font: { family: 'FreeSerif' },
    duration: 'w', 
  })
    .setJustification(VF.TextNote.Justification.CENTER)
    .setLine(-1)
    .setStave(stave);
    
  return spacerNote;
};

const getNoteDurationInBeats = (note: VFNote): number => {
  const duration = (note as unknown as { duration: string }).duration || 'q';
  return beatMap[duration as keyof BeatMap] || 0;
};

const calculateTotalBeats = (notes: VFNote[]): number => {
  return notes.reduce((sum, note) => sum + getNoteDurationInBeats(note), 0);
};

const ensureCompleteMeasure = (notes: VFNote[], stave: Stave): VFNote[] => {
  const totalBeats = calculateTotalBeats(notes);
  
  if (notes.length === 0 || totalBeats !== 4) {
    return [createEmptyChordSpacer(stave)];
  }
  
  return notes;
};

export const createChordTextNotes = (
  data: MultiSheetQuestion,
  topStaves: Stave[],
): VFNote[] => {
  return data.voices[0].stack
    .map((stackedNotes) => {
      if (!stackedNotes.chordName) {
        return null; 
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
        .setStave(topStaves[0]); 
        
      return textNote;
    })
    .filter(Boolean) as VFNote[]; 
};

export const organizeChordsByMeasure = (
  textNotes: VFNote[],
  topStaves: Stave[],
  measuresCount: number
): VFNote[][] => {
  let allMeasureTextNotes: VFNote[][] = Array(measuresCount).fill(0).map(() => []);
  
  if (textNotes.length === 0) {
    for (let i = 0; i < measuresCount; i++) {
      allMeasureTextNotes[i].push(createEmptyChordSpacer(topStaves[i]));
    }
    return allMeasureTextNotes;
  }
  
  let currentBeats = 0;
  let currentMeasureIndex = 0;
  
  for (const textNote of textNotes) {
    const noteDuration = getNoteDurationInBeats(textNote);
    
    if (currentBeats + noteDuration > 4) {
      if (currentBeats < 4) {
        allMeasureTextNotes[currentMeasureIndex].push(createEmptyChordSpacer(topStaves[currentMeasureIndex]));
      }
      
      currentMeasureIndex++;
      currentBeats = 0;
      
      if (currentMeasureIndex >= measuresCount) break;
    }
    
    textNote.setStave(topStaves[currentMeasureIndex]);
    allMeasureTextNotes[currentMeasureIndex].push(textNote);
    currentBeats += noteDuration;
  }
  
  if (currentBeats > 0 && currentBeats < 4 && currentMeasureIndex < measuresCount) {
    allMeasureTextNotes[currentMeasureIndex].push(createEmptyChordSpacer(topStaves[currentMeasureIndex]));
  }
  
  for (let i = 0; i < measuresCount; i++) {
    if (allMeasureTextNotes[i].length === 0) {
      allMeasureTextNotes[i].push(createEmptyChordSpacer(topStaves[i]));
    }
  }
  
  return allMeasureTextNotes;
};

export const renderChordNotation = (
  allMeasureTextNotes: VFNote[][],
  topStaves: Stave[],
  formatter: any,
  context: any
): void => {
  allMeasureTextNotes.forEach((measureNotes, measureIndex) => {
    if (measureNotes.length === 0) return;
    
    const validMeasureNotes = ensureCompleteMeasure(measureNotes, topStaves[measureIndex]);
    
    const textVoice = new VF.Voice({ num_beats: 4, beat_value: 4 })
      .addTickables(validMeasureNotes);
      
    formatter.joinVoices([textVoice]);
    formatter.formatToStave([textVoice], topStaves[measureIndex]);
    textVoice.draw(context, topStaves[measureIndex]);
  });
}; 