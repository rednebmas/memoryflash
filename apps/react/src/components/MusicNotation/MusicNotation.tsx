import React, { useEffect, useRef } from 'react';
import { MultiSheetQuestion } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { VF } from './utils';
import { calculateMeasureCount, setupRenderer, createStavesForVoice, createChordStaves } from './StaveRenderer';
import { createMeasureNotes, renderNotes } from './NoteRenderer';
import { createChordTextNotes, organizeChordsByMeasure, renderChordNotation } from './ChordRenderer';
import { ensureCompleteMeasure } from '../../utils/MusicRecorder';

interface MusicNotationProps {
  data: MultiSheetQuestion;
  highlightClassName?: string;
  allNotesClassName?: string;
  hideChords?: boolean;
}

export const MusicNotation: React.FunctionComponent<MusicNotationProps> = ({
  data,
  allNotesClassName,
  highlightClassName,
  hideChords,
}) => {
  const divRef = useRef<HTMLDivElement>(null);
  const multiPartCardIndex = useAppSelector((state) => state.scheduler.multiPartCardIndex);

  useEffect(() => {
    const div = divRef.current;
    if (!div) return;
    div.innerHTML = '';
    
    // Step 1: Determine the number of measures for this music notation
    const measuresCount = calculateMeasureCount(data.voices, data.measuresCount);
    // Balance each voice to ensure full measures
    const balancedVoices = data.voices.map((voice) => ({
      ...voice,
      stack: ensureCompleteMeasure(voice.stack, measuresCount),
    }));
    
    // Step 2: Setup the renderer and get context
    const { context, treble, bass, measureWidth } = setupRenderer(div, data, measuresCount);
    
    // Step 3: Create a formatter for note positioning
    const formatter = new VF.Formatter();
    const allNotesGroup = context.openGroup();
    
    // Step 4: Process each balanced voice
    balancedVoices.forEach((voice) => {
      // Create staves for this voice
      const staves = createStavesForVoice(
        voice,
        measuresCount,
        measureWidth,
        treble,
        context,
        data.key
      );
      
      // Create notes for each measure
      const allMeasureNotes = createMeasureNotes(
        voice,
        staves,
        measuresCount,
        allNotesClassName,
        highlightClassName,
        multiPartCardIndex,
        data._8va
      );
      
      // Render the notes
      renderNotes(allMeasureNotes, staves, formatter, context, data.key);
    });
    
    // Step 5: Handle chord notation
    if (!hideChords && balancedVoices.length > 0) {
      // Create staves for chord notation
      const topStaves = createChordStaves(
        measuresCount,
        measureWidth,
        treble,
        bass,
        context,
        data.key
      );
      
      // Create chord text notes
      const textNotes = createChordTextNotes(data, topStaves);
      
      // If we have no chord names to render, skip the rest
      if (textNotes.length === 0) {
        context.closeGroup();
        allNotesGroup.classList.add('music-notation-notes');
        return;
      }
      
      // Organize chord notes into measures
      const allMeasureTextNotes = organizeChordsByMeasure(textNotes, topStaves, measuresCount);
      
      // Render chord notation
      renderChordNotation(allMeasureTextNotes, topStaves, formatter, context);
    }

    context.closeGroup();
    allNotesGroup.classList.add('music-notation-notes');
  }, [data, multiPartCardIndex, allNotesClassName, highlightClassName, hideChords]);

  return <div className='svg-dark-mode' ref={divRef} id='output'></div>;
}; 