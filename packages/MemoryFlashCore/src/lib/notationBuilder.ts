import { StaffEnum } from '../types/Cards';
import { MultiSheetQuestion, StackedNotes, Voice } from '../types/MultiSheetCard';
import { insertRestsToFillBars } from './measure';

export function buildMultiSheetQuestion(notes: StackedNotes[], key: string): MultiSheetQuestion {
	const treble: StackedNotes[] = [];
	const bass: StackedNotes[] = [];
	for (const n of notes) {
		if (n.notes.length === 0) {
			if (treble.length || (!treble.length && !bass.length)) treble.push(n);
			if (bass.length) bass.push(n);
			continue;
		}
		const octave = n.notes[0].octave;
		if (octave >= 4) treble.push(n);
		else bass.push(n);
	}

	const voices: Voice[] = [];
	if (treble.length)
		voices.push({ staff: StaffEnum.Treble, stack: insertRestsToFillBars(treble) });
	if (bass.length) voices.push({ staff: StaffEnum.Bass, stack: insertRestsToFillBars(bass) });
	return { key, voices };
}
