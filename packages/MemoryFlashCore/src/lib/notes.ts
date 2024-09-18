export const notes = [
	'C',
	'D',
	'E',
	'F',
	'G',
	'A',
	'B',

	'C#',
	'D#',
	// "E#",
	'F#',
	'G#',
	'A#',
	// "B#",

	// "Cb",
	'Db',
	'Eb',
	'Gb',
	'Ab',
	'Bb',
];

export const uniqueNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C#', 'D#', 'F#', 'G#', 'A#'];

export const majorKeys = [
	'C',
	'G',
	'D',
	'A',
	'E',
	'B',
	'F#',
	'C#',
	'F',
	'Bb',
	'Eb',
	'Ab',
	'Db',
	'Gb',
];

export const minorKeys = [
	'A',
	'E',
	'B',
	'F#',
	'Gb',
	'C#',
	'Db',
	'G#',
	'D#',
	'Eb',
	'A#',
	'Bb',
	'F',
	'C',
	'G',
	'D',
];

export const allKeys = [...majorKeys, ...minorKeys.map((key) => key + 'm')];
