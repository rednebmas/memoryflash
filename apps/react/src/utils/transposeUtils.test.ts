import { MusicRecorder } from './MusicRecorder';
import { transposeToAllKeys, getEnharmonicPreferenceForTargetKey } from './transposeUtils';
import { StaffEnum } from 'MemoryFlashCore/src/types/Cards';
import { MultiSheetQuestion, SheetNote } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { MidiNote } from 'MemoryFlashCore/src/redux/slices/midiSlice';
import { describe, it, expect } from 'vitest';

describe('getEnharmonicPreferenceForTargetKey', () => {
  it('should return true for sharp keys', () => {
    expect(getEnharmonicPreferenceForTargetKey('G')).toBe(true);
    expect(getEnharmonicPreferenceForTargetKey('D')).toBe(true);
    expect(getEnharmonicPreferenceForTargetKey('A')).toBe(true);
    expect(getEnharmonicPreferenceForTargetKey('E')).toBe(true);
    expect(getEnharmonicPreferenceForTargetKey('B')).toBe(true);
    expect(getEnharmonicPreferenceForTargetKey('F#')).toBe(true);
    expect(getEnharmonicPreferenceForTargetKey('C#')).toBe(true);
  });

  it('should return false for flat keys', () => {
    expect(getEnharmonicPreferenceForTargetKey('F')).toBe(false);
    expect(getEnharmonicPreferenceForTargetKey('Bb')).toBe(false);
    expect(getEnharmonicPreferenceForTargetKey('Eb')).toBe(false);
    expect(getEnharmonicPreferenceForTargetKey('Ab')).toBe(false);
    expect(getEnharmonicPreferenceForTargetKey('Db')).toBe(false);
    expect(getEnharmonicPreferenceForTargetKey('Gb')).toBe(false);
    expect(getEnharmonicPreferenceForTargetKey('Cb')).toBe(false);
  });

  it('should return undefined for C major (neutral key)', () => {
    expect(getEnharmonicPreferenceForTargetKey('C')).toBeUndefined();
  });

  it('should return undefined for invalid or unrecognized keys', () => {
    expect(getEnharmonicPreferenceForTargetKey('Xyz')).toBeUndefined();
    expect(getEnharmonicPreferenceForTargetKey('')).toBeUndefined();
    // Tonal.Key.majorKey might still resolve some minor keys or alternative representations,
    // but the core logic relies on 'alteration', so if that's 0, it's undefined preference.
    expect(getEnharmonicPreferenceForTargetKey('Am')).toBeUndefined(); // A minor has 0 alterations
  });
});

describe('transposeToAllKeys', () => {
  it('should correctly transpose C4 and D4 in C major to E major, resulting in E4 and F#4', () => {
    // 1. Setup MusicRecorder
    const keySignature = 'C';
    const middleNote = 60; // C4
    const measuresCount = 1;
    const noteDuration = 'h'; // Half notes
    const recorder = new MusicRecorder(keySignature, middleNote, measuresCount, noteDuration);

    // 2. Record C4 then D4
    const midiNotesC4: MidiNote[] = [{ number: 60 }]; // C4
    recorder.recordNotes(midiNotesC4);

    const midiNotesD4: MidiNote[] = [{ number: 62 }]; // D4
    recorder.recordNotes(midiNotesD4);

    // 3. Get the MultiSheetQuestion
    const originalMusic: MultiSheetQuestion = recorder.toMultiSheetQuestion();

    // Ensure we have one voice (treble) and two notes as expected before transposition
    expect(originalMusic.voices.length).toBe(1);
    expect(originalMusic.voices[0].staff).toBe(StaffEnum.Treble);
    expect(originalMusic.voices[0].stack.length).toBe(2);
    expect(originalMusic.voices[0].stack[0].notes[0].name).toBe('C');
    expect(originalMusic.voices[0].stack[0].notes[0].octave).toBe(4);
    expect(originalMusic.voices[0].stack[1].notes[0].name).toBe('D');
    expect(originalMusic.voices[0].stack[1].notes[0].octave).toBe(4);

    // 4. Transpose to all keys
    const transposedMusicArray = transposeToAllKeys(originalMusic, keySignature);

    // 5. Find the E major transposition
    const eMajorMusic = transposedMusicArray.find(music => music.key === 'E');
    expect(eMajorMusic).toBeDefined();
    if (!eMajorMusic) return; // Type guard

    // 6. Assert the notes in E major
    // Expecting E4 and F#4
    const voiceInEMajor = eMajorMusic.voices[0];
    expect(voiceInEMajor).toBeDefined();
    if (!voiceInEMajor) return; // Type guard

    expect(voiceInEMajor.stack.length).toBe(2); 

    const firstNoteInE = voiceInEMajor.stack[0].notes[0];
    expect(firstNoteInE.name).toBe('E');
    expect(firstNoteInE.octave).toBe(4);

    const secondNoteInE = voiceInEMajor.stack[1].notes[0];
    // This is the failing assertion: expecting F# but might get Gb
    expect(secondNoteInE.name).toBe('F#');
    expect(secondNoteInE.octave).toBe(4);
  });
}); 