import { MultiSheetQuestion, Voice, StackedNotes, SheetNote } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { StaffEnum } from 'MemoryFlashCore/src/types/Cards';
import { Midi } from 'tonal';
import { namedInKey } from './midiNotesToMultiSheetQuestion';

type MidiNote = {
  number: number;
  clicked?: boolean;
};

/**
 * Simple utility to record MIDI notes as musical notation
 */
export class MusicRecorder {
  private _noteDuration: string;
  private _measuresCount: number;
  private _middleNote: number;
  private _key: string;
  private _stacks: StackedNotes[] = [];
  private _currentPosition = 0;
  
  constructor(key = 'C', middleNote = 60, measuresCount = 1, noteDuration = 'h') {
    this._key = key;
    this._middleNote = middleNote;
    this._measuresCount = measuresCount;
    this._noteDuration = noteDuration;
    this._initializeStacks();
  }
  
  /**
   * Initialize empty stacks based on current settings
   */
  private _initializeStacks() {
    // Calculate how many notes fit in each measure based on duration
    const notesPerMeasure = this._getNotesPerMeasure();
    const totalPositions = notesPerMeasure * this._measuresCount;
    
    // Create empty stacks for each position
    this._stacks = Array(totalPositions).fill(null).map(() => ({
      notes: [],
      duration: this._noteDuration
    }));
    
    this._currentPosition = 0;
  }
  
  /**
   * Get how many notes of current duration fit in a 4/4 measure
   */
  private _getNotesPerMeasure(): number {
    switch (this._noteDuration) {
      case 'w': return 1;
      case 'h': return 2;
      case 'q': return 4;
      case '8': return 8;
      case '16': return 16;
      default: return 2; // Default to half notes
    }
  }
  
  /**
   * Record current MIDI notes at the current position and advance
   */
  recordNotes(midiNotes: MidiNote[]) {
    if (this._currentPosition >= this._stacks.length) {
      return false; // Can't record any more notes
    }
    
    // Convert MIDI numbers to properly named notes
    const notes = midiNotes.map(note => {
      const fullNote = namedInKey(note.number, this._key);
      const parts = fullNote.match(/([A-G][b#]*)(\d+)/);
      
      if (!parts) {
        throw new Error(`Invalid note format: ${fullNote}`);
      }
      
      return {
        name: parts[1],
        octave: parseInt(parts[2])
      };
    });
    
    // Record notes at current position
    this._stacks[this._currentPosition] = {
      notes,
      duration: this._noteDuration
    };
    
    // Move to next position
    this._currentPosition++;
    
    return true;
  }
  
  /**
   * Get information about the current recording state
   */
  getState() {
    return {
      currentPosition: this._currentPosition,
      totalPositions: this._stacks.length,
      isComplete: this._currentPosition >= this._stacks.length
    };
  }
  
  /**
   * Reset the recorder to start a new recording
   */
  reset() {
    this._initializeStacks();
  }
  
  /**
   * Update settings and reset the recorder
   */
  updateSettings({
    key, 
    middleNote, 
    measuresCount, 
    noteDuration
  }: {
    key?: string;
    middleNote?: number;
    measuresCount?: number;
    noteDuration?: string;
  }) {
    let needsReset = false;
    
    if (key !== undefined && key !== this._key) {
      this._key = key;
      needsReset = true;
    }
    
    if (middleNote !== undefined && middleNote !== this._middleNote) {
      this._middleNote = middleNote;
      needsReset = true;
    }
    
    if (measuresCount !== undefined && measuresCount !== this._measuresCount) {
      this._measuresCount = measuresCount;
      needsReset = true;
    }
    
    if (noteDuration !== undefined && noteDuration !== this._noteDuration) {
      this._noteDuration = noteDuration;
      needsReset = true;
    }
    
    if (needsReset) {
      this.reset();
    }
  }
  
  /**
   * Convert recorded notes to the MultiSheetQuestion format
   */
  toMultiSheetQuestion(): MultiSheetQuestion {
    // Only include up to current position
    const activeStacks = this._stacks.slice(0, this._currentPosition);
    
    // Group by staff (treble/bass)
    const trebleStacks: StackedNotes[] = [];
    const bassStacks: StackedNotes[] = [];
    
    let hasTrebleNotes = false;
    let hasBassNotes = false;
    
    // Process each stack
    activeStacks.forEach(stack => {
      // Split notes between treble and bass
      const trebleNotes = stack.notes.filter(note => {
        const midiNum = Midi.toMidi(`${note.name}${note.octave}`);
        return midiNum !== null && midiNum >= this._middleNote;
      });
      
      const bassNotes = stack.notes.filter(note => {
        const midiNum = Midi.toMidi(`${note.name}${note.octave}`);
        return midiNum !== null && midiNum < this._middleNote;
      });
      
      // Add to respective stacks
      if (trebleNotes.length > 0) {
        hasTrebleNotes = true;
      }
      
      if (bassNotes.length > 0) {
        hasBassNotes = true;
      }
      
      trebleStacks.push({
        notes: trebleNotes,
        duration: stack.duration
      });
      
      bassStacks.push({
        notes: bassNotes,
        duration: stack.duration
      });
    });
    
    // Create voices array
    const voices: Voice[] = [];
    
    // Only add voices if they have actual notes
    if (hasTrebleNotes) {
      voices.push({
        staff: StaffEnum.Treble,
        stack: trebleStacks
      });
    }
    
    if (hasBassNotes) {
      voices.push({
        staff: StaffEnum.Bass,
        stack: bassStacks
      });
    }
    
    return {
      voices,
      key: this._key,
      _8va: false
    };
  }
}