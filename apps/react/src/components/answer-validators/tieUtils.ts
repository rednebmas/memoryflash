import { Midi, Note } from 'tonal';
import { StackedNotes } from 'MemoryFlashCore/src/types/MultiSheetCard';
import {
	questionToTimeline,
	notesForSlice as notesForSliceMidi,
	computeTieSkipAdvance,
	NoteProjection,
} from 'MemoryFlashCore/src/lib/answerTimeline';

export { questionToTimeline, computeTieSkipAdvance };

export const notesForSlice = notesForSliceMidi;

export function chromaForSlice(timeline: StackedNotes[], index: number): number[] {
	return notesForSliceMidi(timeline, index).map((m) => Note.chroma(Midi.midiToNoteName(m)));
}

export type { NoteProjection };
