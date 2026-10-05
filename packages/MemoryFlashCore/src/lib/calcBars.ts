import { MultiSheetQuestion, StackedNotes } from '../types/MultiSheetCard';
import { beatsPerBarOf, durationBeats } from './measure';

export const stackBeats = (stack: StackedNotes[]) =>
	stack.reduce((sum, n) => sum + durationBeats[n.duration], 0);

export function calcBars(data: MultiSheetQuestion): number {
	const max = Math.max(...data.voices.map((v) => stackBeats(v.stack)), 0);
	return Math.max(1, Math.ceil(max / beatsPerBarOf(data)));
}
