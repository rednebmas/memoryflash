import { Chord, Note } from 'tonal';
import { ChordMemoryChord, StaffEnum } from '../types/Cards';
import { MultiSheetQuestion } from '../types/MultiSheetCard';
import { parseKey } from './romanNumerals';

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

export const chordMemoryQuestion = (prompt: string, key: string): MultiSheetQuestion => ({
	key: parseKey(key).tonic,
	voices: [{ staff: StaffEnum.Treble, stack: [{ notes: [], duration: 'w', rest: true }] }],
	presentationModes: [{ id: 'Text Prompt', text: prompt }],
});
