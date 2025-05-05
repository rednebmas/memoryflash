import { Stave } from 'vexflow';
import { MultiSheetQuestion, Voice } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { StaffEnum } from 'MemoryFlashCore/src/types/Cards';
import { VF, calculateTotalBeats } from './utils';

// Calculate the number of measures based on the total beats
export const calculateMeasureCount = (voices: Voice[], specifiedCount?: number): number => {
  // If a measure count is explicitly specified, use that
  if (specifiedCount !== undefined) {
    return specifiedCount;
  }
  
  if (!voices.length) return 1;
  
  // Get total beats from the longest voice
  const maxBeats = Math.max(...voices.map(voice => calculateTotalBeats(voice.stack)));
  
  // Each measure is 4 beats in 4/4 time, round up to nearest measure
  return Math.max(1, Math.ceil(maxBeats / 4));
};

// Setup renderer and get context
export const setupRenderer = (
  div: HTMLDivElement,
  data: MultiSheetQuestion,
  measuresCount: number
) => {
  const treble = !!data.voices.find((e) => e.staff === StaffEnum.Treble);
  const bass = !!data.voices.find((e) => e.staff === StaffEnum.Bass);

  const renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);
  const context = renderer.getContext();
  
  // Calculate width based on number of measures
  // Base width for a single measure
  const measureWidth = 200;
  const width = measureWidth * measuresCount;
  const height = treble && bass ? 250 : 160;

  renderer.resize(width + 2, height);

  return { context, width, height, treble, bass, measureWidth };
};

// Create staves for a voice
export const createStavesForVoice = (
  voice: Voice,
  measuresCount: number,
  measureWidth: number,
  treble: boolean,
  context: any,
  key: string
): Stave[] => {
  const staves: Stave[] = [];
  let currentX = 0;
  
  // Create multiple staves for each measure
  for (let i = 0; i < measuresCount; i++) {
    // Setup Y position based on staff type
    const staffY = voice.staff === StaffEnum.Treble ? 20 : (treble ? 120 : 20);
    
    // Create a new stave for this measure
    const stave = new VF.Stave(currentX, staffY, measureWidth);
    
    // For the first measure, add clef and key signature
    if (i === 0) {
      stave.addClef(voice.staff === StaffEnum.Treble ? 'treble' : 'bass')
           .addTimeSignature('4/4')
           .addKeySignature(key);
    }
    
    // Set context and draw the stave
    stave.setContext(context).draw();
    
    // Add to our collection of staves
    staves.push(stave);
    
    // Move X position for next stave
    currentX += measureWidth;
  }
  
  return staves;
};

// Create staves for chord notation (top staves)
export const createChordStaves = (
  measuresCount: number,
  measureWidth: number,
  treble: boolean,
  bass: boolean,
  context: any,
  key: string
): Stave[] => {
  const topStaves: Stave[] = [];
  
  let currentX = 0;
  for (let i = 0; i < measuresCount; i++) {
    // Create temporary staves just for positioning the chord names
    const staffY = treble ? 20 : (bass ? 20 : 20);
    const stave = new VF.Stave(currentX, staffY, measureWidth);
    
    if (i === 0) {
      stave.addClef(treble ? 'treble' : 'bass')
           .addTimeSignature('4/4')
           .addKeySignature(key);
    }
    
    // CRITICAL: Attach the context to the stave to avoid NoContext error
    stave.setContext(context);
    
    // We don't need to draw these staves since they're just for positioning,
    // but they MUST have a context set
    
    topStaves.push(stave);
    currentX += measureWidth;
  }
  
  return topStaves;
}; 