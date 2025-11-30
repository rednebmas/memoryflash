import { Chord } from 'tonal';
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
