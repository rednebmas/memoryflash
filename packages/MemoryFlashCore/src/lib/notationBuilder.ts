import { StaffEnum } from '../types/Cards';
import { MultiSheetQuestion, StackedNotes, Voice } from '../types/MultiSheetCard';

const DURATIONS: Array<[StackedNotes['duration'], number]> = [
	['w', 4],
	['h', 2],
	['q', 1],
	['8', 0.5],
	['16', 0.25],
];

const beatsOf = (duration: StackedNotes['duration']): number => {
	const base = duration.replace('r', '') as StackedNotes['duration'];
	const entry = DURATIONS.find(([d]) => d === base);
	return entry ? entry[1] : 0;
};

const beatsToDurations = (beats: number): StackedNotes['duration'][] => {
	const durs: StackedNotes['duration'][] = [];
	for (const [dur, val] of DURATIONS) {
		while (beats >= val - 1e-6) {
			durs.push(`${dur}r` as StackedNotes['duration']);
			beats -= val;
		}
	}
	return durs;
};

export const addRests = (notes: StackedNotes[]): StackedNotes[] => {
	const total = notes.reduce((s, n) => s + beatsOf(n.duration), 0);
	const remainder = 4 - (total % 4);
	if (remainder === 4 || remainder === 0) return notes;
	return [
		...notes,
		...beatsToDurations(remainder).map((duration) => ({
			notes: [{ name: 'b', octave: 4 }],
			duration,
		})),
	];
};

export const buildMultiSheetQuestion = (notes: StackedNotes[], key: string): MultiSheetQuestion => {
	const filled = addRests(notes);
	const treble: StackedNotes[] = [];
	const bass: StackedNotes[] = [];
	filled.forEach((n) => {
		if (n.notes[0].octave >= 4) treble.push(n);
		else bass.push(n);
	});
	const voices: Voice[] = [];
	if (treble.length) voices.push({ staff: StaffEnum.Treble, stack: treble });
	if (bass.length) voices.push({ staff: StaffEnum.Bass, stack: bass });
	return { key, voices };
};
