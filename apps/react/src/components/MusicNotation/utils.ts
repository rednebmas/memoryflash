import { Vex } from 'vexflow';
import { StackedNotes } from 'MemoryFlashCore/src/types/MultiSheetCard';

export const VF = Vex.Flow;

// Type for beat duration mapping
export type BeatMap = {
  'w': number;
  'h': number;
  'q': number;
  '8': number;
  '16': number;
  '32': number;
  '64': number;
};

// Beat map for duration calculations
export const beatMap: BeatMap = { 
  'w': 4, 
  'h': 2, 
  'q': 1, 
  '8': 0.5, 
  '16': 0.25, 
  '32': 0.125, 
  '64': 0.0625 
};

// Calculate total beats in a stack of notes
export const calculateTotalBeats = (stack: StackedNotes[]) => {
  return stack.reduce((total: number, item: StackedNotes) => {
    return total + (beatMap[item.duration as keyof BeatMap] || 0);
  }, 0);
};

// Helper function to get the correct rest positions based on standard music notation
export const getRestPosition = (duration: string, clef: string): string => {
  // Standard rest positions in treble clef
  if (clef === 'treble') {
    // Whole and half rests sit on the middle line (B4)
    if (duration === 'w' || duration === 'h') {
      return 'b/4';
    }
    // Quarter rests sit centered on the staff (often shown as D5)
    else if (duration === 'q') {
      return 'd/5';
    }
    // Eighth rests and shorter generally centered (D5)
    else {
      return 'd/5';
    }
  }
  // Standard rest positions in bass clef
  else if (clef === 'bass') {
    // Whole and half rests sit on the middle line (D3)
    if (duration === 'w' || duration === 'h') {
      return 'd/3';
    }
    // Quarter rests sit centered on the staff (often shown as F3)
    else if (duration === 'q') {
      return 'f/3';
    }
    // Eighth rests and shorter generally centered (F3)
    else {
      return 'f/3';
    }
  }
  
  // Default fallback
  return 'b/4';
}; 