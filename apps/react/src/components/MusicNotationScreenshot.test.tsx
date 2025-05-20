import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { render } from '@testing-library/react';
import { MusicNotation } from './MusicNotation';
import { MultiSheetQuestion } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { StaffEnum } from 'MemoryFlashCore/src/types/Cards';
import type { ReduxState } from 'MemoryFlashCore/src/redux/store';
import { MusicRecorder } from '../utils/MusicRecorder';
import React from 'react';
import '../test/setup-screenshots';
import { captureDomScreenshot, handleSnapshotFailure } from '../test/screenshot-helpers';
import type { MatchImageSnapshotOptions } from 'jest-image-snapshot';

// Mock the useAppSelector hook
vi.mock('MemoryFlashCore/src/redux/store', () => ({
  useAppSelector: (selector: (state: ReduxState) => any) => 0, // Always return 0 for multiPartCardIndex
}));

// Mock browser-specific APIs needed by VexFlow
beforeAll(() => {
  // Mock SVG getBBox
  // @ts-ignore - Add getBBox to SVG prototype
  if (!SVGElement.prototype.getBBox) {
    // @ts-ignore - OK to ignore in test context
    SVGElement.prototype.getBBox = vi.fn().mockReturnValue({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    });
  }
  
  // Mock text measurement
  if (!window.SVGTextElement) {
    // @ts-ignore
    window.SVGTextElement = class SVGTextElement extends SVGElement {};
    // @ts-ignore
    SVGTextElement.prototype.getComputedTextLength = vi.fn().mockReturnValue(50);
  }
});

// Helper function to render MusicNotation and capture screenshot
async function renderAndCapture(
  data: MultiSheetQuestion, 
  options: { 
    width?: number; 
    height?: number; 
    hideChords?: boolean; 
    testName: string;
  }
): Promise<void> {
  const { width = 800, height = 400, hideChords, testName } = options;
  
  // Render the component
  const { container } = render(
    <MusicNotation 
      data={data} 
      hideChords={hideChords}
    />
  );
  
  // Wait a bit for rendering to complete
  await new Promise(resolve => setTimeout(resolve, 50));
  
  try {
    // Capture screenshot
    const screenshot = await captureDomScreenshot(container, { width, height });
    
    // Compare with snapshot
    expect(screenshot).toMatchImageSnapshot({
      customSnapshotIdentifier: testName
    } as MatchImageSnapshotOptions);
  } catch (error) {
    // Handle snapshot failure with HTML report
    handleSnapshotFailure(error as Error, testName);
  }
}

describe('MusicNotation Screenshot Tests', () => {
  it('renders treble clef notation correctly', async () => {
    // Create a recorder with default settings
    const recorder = new MusicRecorder('C', 60, 1, 'h');
    
    // Record notes
    recorder.recordNotes([{ number: 60 }]); // C4
    recorder.recordNotes([{ number: 64 }]); // E4
    recorder.recordNotes([{ number: 67 }]); // G4
    
    // Get the data
    const mockData = recorder.toMultiSheetQuestion();
    
    await renderAndCapture(mockData, { testName: 'treble-clef' });
  });
  
  it('renders bass clef notation correctly', async () => {
    // Create a recorder with bass notes
    const recorder = new MusicRecorder('C', 48, 1, 'h');
    
    // Record notes
    recorder.recordNotes([{ number: 48 }]); // C3
    recorder.recordNotes([{ number: 52 }]); // E3
    recorder.recordNotes([{ number: 55 }]); // G3
    
    // Get the data
    const mockData = recorder.toMultiSheetQuestion();
    
    await renderAndCapture(mockData, { testName: 'bass-clef' });
  });
  
  it('renders multi-staff notation correctly', async () => {
    // Create a recorder with notes for both staves
    const recorder = new MusicRecorder('G', 60, 1, 'h');
    
    // Add treble clef notes
    recorder.recordNotes([{ number: 60 }]); // C4
    recorder.recordNotes([{ number: 64 }]); // E4
    
    // Add bass clef note
    recorder.recordNotes([{ number: 43 }]); // G2
    recorder.recordNotes([{ number: 47 }]); // B2
    
    // Get the data
    const mockData = recorder.toMultiSheetQuestion();
    
    await renderAndCapture(mockData, { testName: 'multi-staff' });
  });
  
  it('renders chord notation correctly', async () => {
    // Create a recorder
    const recorder = new MusicRecorder('C', 60, 1, 'h');
    
    // Record C major chord notes
    recorder.recordNotes([
      { number: 60 }, // C4
      { number: 64 }, // E4
      { number: 67 }, // G4
    ]);
    
    // Record another note to complete the measure
    recorder.recordNotes([{ number: 69 }]); // A4
    
    // Get the data
    const mockData = recorder.toMultiSheetQuestion();
    
    // Add chord name
    mockData.voices[0].stack[0].chordName = 'Cmaj7';
    mockData.voices[0].stack[1].chordName = 'A';
    
    await renderAndCapture(mockData, { testName: 'chord-notation', hideChords: false });
  });
  
  it('renders multiple measures correctly', async () => {
    // Create a recorder with 2 measures
    const recorder = new MusicRecorder('C', 60, 2, 'h');
    
    // First measure
    recorder.recordNotes([{ number: 60 }]); // C4
    recorder.recordNotes([{ number: 62 }]); // D4
    
    // Second measure
    recorder.recordNotes([{ number: 64 }]); // E4
    recorder.recordNotes([{ number: 65 }]); // F4
    
    // Get the data
    const mockData = recorder.toMultiSheetQuestion();
    
    await renderAndCapture(mockData, { width: 1000, testName: 'multiple-measures' });
  });
}); 