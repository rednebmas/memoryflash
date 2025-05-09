import { Stave } from 'vexflow';
import { MultiSheetQuestion, Voice } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { StaffEnum } from 'MemoryFlashCore/src/types/Cards';
import { VF, calculateTotalBeats } from './utils';

export const calculateMeasureCount = (voices: Voice[], specifiedCount?: number): number => {
  if (specifiedCount !== undefined) {
    return specifiedCount;
  }
  
  if (!voices.length) return 1;
  
  const maxBeats = Math.max(...voices.map(voice => calculateTotalBeats(voice.stack)));
  
  return Math.max(1, Math.ceil(maxBeats / 4));
};

export const setupRenderer = (
  div: HTMLDivElement,
  data: MultiSheetQuestion,
  measuresCount: number
) => {
  const treble = !!data.voices.find((e) => e.staff === StaffEnum.Treble);
  const bass = !!data.voices.find((e) => e.staff === StaffEnum.Bass);

  const renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);
  const context = renderer.getContext();
  
  const measureWidth = 280;
  const width = measureWidth * measuresCount;
  const height = treble && bass ? 250 : 160;

  renderer.resize(width + 2, height);

  return { context, width, height, treble, bass, measureWidth };
};

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
  
  for (let i = 0; i < measuresCount; i++) {
    const staffY = voice.staff === StaffEnum.Treble ? 20 : (treble ? 120 : 20);
    
    const stave = new VF.Stave(currentX, staffY, measureWidth);
    if (i === 0) {
      stave.addClef(voice.staff === StaffEnum.Treble ? 'treble' : 'bass')
           .addTimeSignature('4/4')
           .addKeySignature(key);
    }
    
    stave.setContext(context).draw();
    
    staves.push(stave);
    
    currentX += measureWidth;
  }
  
  return staves;
};

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
    const staffY = treble ? 20 : (bass ? 20 : 20);
    const stave = new VF.Stave(currentX, staffY, measureWidth);
    
    if (i === 0) {
      stave.addClef(treble ? 'treble' : 'bass')
           .addTimeSignature('4/4')
           .addKeySignature(key);
    }
    
    stave.setContext(context);
    
    topStaves.push(stave);
    currentX += measureWidth;
  }
  
  return topStaves;
}; 