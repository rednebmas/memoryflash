import { Midi, Note } from 'tonal';
import {
	questionToTimeline,
	notesForSlice,
	computeTieSkipAdvance,
} from 'MemoryFlashCore/src/lib/answerTimeline';

export { questionToTimeline, notesForSlice, computeTieSkipAdvance };

export function chromaForSlice(timeline: number[][], index: number): number[] {
	return notesForSlice(timeline, index).map((m) => Note.chroma(Midi.midiToNoteName(m)));
}
