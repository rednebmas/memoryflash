import { SheetNote } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { CardTypeEnum, StaffEnum } from 'MemoryFlashCore/src/types/Cards';
import { MultiSheetQuestion, Voice } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { uniqueNotes } from 'MemoryFlashCore/src/lib/notes';

// Convert MIDI note number to SheetNote
export const midiNoteToSheetNote = (midiNote: string): SheetNote => {
  const noteNumber = parseInt(midiNote.split(':')[1]);
  const octave = Math.floor(noteNumber / 12) - 1;
  const noteIndex = noteNumber % 12;
  
  return {
    name: uniqueNotes[noteIndex],
    octave
  };
};

// Create MultiSheet question data for the notation component
export const createNotationData = (
  rightHandNotes: SheetNote[], 
  leftHandNotes: SheetNote[], 
  key: string
): MultiSheetQuestion => {
  const trebleVoice: Voice = {
    staff: StaffEnum.Treble,
    stack: [
      {
        notes: rightHandNotes,
        duration: "q"
      }
    ]
  };
  
  const bassVoice: Voice = {
    staff: StaffEnum.Bass,
    stack: [
      {
        notes: leftHandNotes,
        duration: "q"
      }
    ]
  };
  
  return {
    key,
    voices: [trebleVoice, bassVoice]
  };
};

// Create MultiSheet card for the MusicNotation component
export const createMultiSheetCard = (
  rightHandNotes: SheetNote[], 
  leftHandNotes: SheetNote[], 
  key: string, 
  uid: string = 'preview'
) => {
  return {
    uid,
    type: CardTypeEnum.MultiSheet,
    question: createNotationData(rightHandNotes, leftHandNotes, key),
    answer: { type: 'ExactMulti' }
  };
};