import { MusicRecorder } from './MusicRecorder';
import { StaffEnum } from 'MemoryFlashCore/src/types/Cards';

describe('MusicRecorder', () => {
  // Test initialization
  test('initializes with default settings', () => {
    const recorder = new MusicRecorder();
    const state = recorder.getState();
    
    expect(state.currentPosition).toBe(0);
    expect(state.totalPositions).toBe(2); // Default 1 measure of half notes = 2 positions
    expect(state.isComplete).toBe(false);
  });
  
  // Test recording notes
  test('records notes and advances position', () => {
    const recorder = new MusicRecorder('C', 60, 1, 'h');
    
    // Add C major triad
    const result = recorder.recordNotes([
      { number: 60 },  // C4
      { number: 64 },  // E4
      { number: 67 }   // G4
    ]);
    
    expect(result).toBe(true);
    expect(recorder.getState().currentPosition).toBe(1);
    
    // Get recorded music
    const music = recorder.toMultiSheetQuestion();
    
    expect(music.key).toBe('C');
    expect(music.voices.length).toBe(1); // Only treble voice since all notes are >= middle C
    expect(music.voices[0].staff).toBe(StaffEnum.Treble);
    expect(music.voices[0].stack.length).toBe(1);
    expect(music.voices[0].stack[0].notes.length).toBe(3);
  });
  
  // Test reaching the end of recording
  test('stops recording when all positions are filled', () => {
    const recorder = new MusicRecorder('C', 60, 1, 'h');
    
    // Two half notes fill a measure in 4/4
    recorder.recordNotes([{ number: 60 }]); // First half note
    expect(recorder.getState().isComplete).toBe(false);
    
    recorder.recordNotes([{ number: 64 }]); // Second half note
    expect(recorder.getState().isComplete).toBe(true);
    
    // Try to add more notes (should fail)
    const result = recorder.recordNotes([{ number: 67 }]);
    expect(result).toBe(false);
    expect(recorder.getState().currentPosition).toBe(2);
  });
  
  // Test resetting the recorder
  test('resets the recorder to start over', () => {
    const recorder = new MusicRecorder();
    
    recorder.recordNotes([{ number: 60 }]);
    expect(recorder.getState().currentPosition).toBe(1);
    
    recorder.reset();
    expect(recorder.getState().currentPosition).toBe(0);
    expect(recorder.getState().isComplete).toBe(false);
  });
  
  // Test splitting notes between treble and bass
  test('splits notes between treble and bass staves', () => {
    const recorder = new MusicRecorder('C', 60, 1, 'w');
    
    // Record notes with some in treble and some in bass
    recorder.recordNotes([
      { number: 48 },  // C3 (bass)
      { number: 60 },  // C4 (treble - at the split point)
      { number: 72 }   // C5 (treble)
    ]);
    
    const music = recorder.toMultiSheetQuestion();
    
    // Check we have both voices
    expect(music.voices.length).toBe(2); 
    
    // Find treble and bass voices
    const trebleVoice = music.voices.find(v => v.staff === StaffEnum.Treble);
    const bassVoice = music.voices.find(v => v.staff === StaffEnum.Bass);
    
    expect(trebleVoice).toBeDefined();
    expect(bassVoice).toBeDefined();
    
    // Check treble notes
    expect(trebleVoice?.stack[0].notes.length).toBe(2); // C4 and C5
    
    // Check bass notes
    expect(bassVoice?.stack[0].notes.length).toBe(1); // C3
  });
  
  // Test updating settings
  test('updates settings and resets when needed', () => {
    const recorder = new MusicRecorder('C', 60, 1, 'h');
    
    recorder.recordNotes([{ number: 60 }]); // Add one note
    expect(recorder.getState().currentPosition).toBe(1);
    
    // Change measure count, which should reset
    recorder.updateSettings({ measuresCount: 2 });
    expect(recorder.getState().currentPosition).toBe(0);
    expect(recorder.getState().totalPositions).toBe(4); // 2 measures of half notes = 4 positions
    
    // Change note duration
    recorder.updateSettings({ noteDuration: 'q' });
    expect(recorder.getState().totalPositions).toBe(8); // 2 measures of quarter notes = 8 positions
    
    // Change key signature (should reset)
    recorder.updateSettings({ key: 'F' });
    expect(recorder.getState().currentPosition).toBe(0);
  });
});