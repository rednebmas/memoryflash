import { MultiSheetQuestion } from '../types/MultiSheetCard';
import { durationBeats } from './measure';

export function calcBars(data: MultiSheetQuestion): number {
	const beats = data.voices.map((v) =>
		v.stack.reduce((sum, n) => sum + durationBeats[n.duration], 0),
	);
	const max = Math.max(...beats, 0);
	return Math.max(1, Math.ceil(max / 4));
}
