import { Chord, Note } from 'tonal';

export type ExtensionVoicing = { suffix: string; degrees: number[]; rhFloor: string };
export type VoicedChord = { symbol: string; lh: string[]; rh: string[] };

const ROOT_SPELLINGS = [
	['C'],
	['Db', 'C#'],
	['D'],
	['Eb', 'D#'],
	['E'],
	['F'],
	['Gb', 'F#'],
	['G'],
	['Ab', 'G#'],
	['A'],
	['Bb', 'A#'],
	['B'],
];
const AWKWARD = ['E#', 'B#', 'Fb', 'Cb'];
const OCTAVES = [1, 2, 3, 4, 5, 6];
const LH_GAP = 7;

const awkwardness = (note: string) => {
	const { pc, acc } = Note.get(note);
	if (acc.length > 1) return 10;
	return AWKWARD.includes(pc) ? 5 : acc.length;
};

const degreeNotes = (symbol: string, degrees: number[]) => {
	const { notes, intervals } = Chord.get(symbol);
	return degrees.map((d) => notes[intervals.findIndex((i) => parseInt(i) === d)]);
};

const spellingScore = (symbol: string, degrees: number[]) =>
	[Chord.get(symbol).tonic!, ...degreeNotes(symbol, degrees)].reduce(
		(sum, n) => sum + awkwardness(n),
		0,
	);

export const chordSymbol = (spellings: string[], v: ExtensionVoicing) =>
	spellings
		.map((root) => root + v.suffix)
		.reduce((best, s) =>
			spellingScore(s, v.degrees) < spellingScore(best, v.degrees) ? s : best,
		);

const midi = (note: string) => Note.midi(note)!;
const placeAbove = (pc: string, min: number) =>
	OCTAVES.map((o) => pc + o).find((n) => midi(n) >= min)!;
const placeBelow = (pc: string, max: number) =>
	OCTAVES.map((o) => pc + o)
		.filter((n) => midi(n) <= max)
		.pop()!;

export function voiceChord(symbol: string, v: ExtensionVoicing): VoicedChord {
	const rh: string[] = [];
	degreeNotes(symbol, v.degrees).forEach((pc) => {
		const min = rh.length ? midi(rh[rh.length - 1]) + 1 : midi(v.rhFloor);
		rh.push(placeAbove(pc, min));
	});
	const root = placeBelow(Chord.get(symbol).tonic!, midi(rh[0]) - LH_GAP);
	return { symbol, lh: [root], rh };
}

export const voiceAllRoots = (v: ExtensionVoicing) =>
	ROOT_SPELLINGS.map((spellings) => voiceChord(chordSymbol(spellings, v), v));
