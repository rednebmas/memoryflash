import { Chord, Note } from 'tonal';
import { ChordMemoryChord } from '../types/Cards';

export function getChordTones(chordName: string): string[] {
	const chord = Chord.get(chordName);
	return chord.notes;
}

export function getDefaultChordMemoryChord(chordName: string): ChordMemoryChord {
	const tones = getChordTones(chordName);
	return {
		chordName,
		requiredTones: tones,
		optionalTones: [],
	};
}

export function tonesToChromas(tones: string[]): number[] {
	return tones.map((t) => Note.chroma(t)).filter((c): c is number => typeof c === 'number');
}

export function chordNameToChromas(chordName: string): number[] {
	return tonesToChromas(getChordTones(chordName));
}

export function invalidChordNames(chords: string[]): string[] {
	return chords.filter((c) => Chord.get(c).empty);
}
