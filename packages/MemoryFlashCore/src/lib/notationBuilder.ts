import { StaffEnum } from '../types/Cards';
import { MultiSheetQuestion, StackedNotes, Voice } from '../types/MultiSheetCard';

export function buildMultiSheetQuestion(notes: StackedNotes[], key: string): MultiSheetQuestion {
	const treble: StackedNotes[] = [];
	const bass: StackedNotes[] = [];
	for (const n of notes) {
		const octaves = n.notes.map((note) => note.octave);
		const minOctave = octaves.length ? Math.min(...octaves) : 0;
		if (minOctave >= 4) treble.push(n);
		else bass.push(n);
	}
	const voices: Voice[] = [];
	if (treble.length) voices.push({ staff: StaffEnum.Treble, stack: treble });
	if (bass.length) voices.push({ staff: StaffEnum.Bass, stack: bass });
	return { key, voices };
}
