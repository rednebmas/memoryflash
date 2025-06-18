import { StaffEnum } from '../types/Cards';
import { MultiSheetQuestion, StackedNotes, Voice } from '../types/MultiSheetCard';
import { Note } from 'tonal';

export function buildMultiSheetQuestion(
	notes: StackedNotes[],
	key: string,
	splitMidi: number = Note.midi('C4')!,
): MultiSheetQuestion {
	const toMidi = (note: { name: string; octave: number }) =>
		Note.midi(`${note.name}${note.octave}`)!;

	const trebleVisible = notes.some((n) => n.notes.some((note) => toMidi(note) >= splitMidi));
	const bassVisible = notes.some((n) => n.notes.some((note) => toMidi(note) < splitMidi));

	const treble: StackedNotes[] = [];
	const bass: StackedNotes[] = [];

	for (const n of notes) {
		const trebleNotes = n.notes.filter((note) => toMidi(note) >= splitMidi);
		const bassNotes = n.notes.filter((note) => toMidi(note) < splitMidi);

		if (trebleVisible) {
			if (trebleNotes.length) {
				treble.push({ ...n, notes: trebleNotes });
			} else {
				treble.push({ notes: [], duration: n.duration, rest: true });
			}
		}

		if (bassVisible) {
			if (bassNotes.length) {
				bass.push({ ...n, notes: bassNotes });
			} else {
				bass.push({ notes: [], duration: n.duration, rest: true });
			}
		}
	}

	const voices: Voice[] = [];
	if (trebleVisible) voices.push({ staff: StaffEnum.Treble, stack: treble });
	if (bassVisible) voices.push({ staff: StaffEnum.Bass, stack: bass });
	return { key, voices };
}
