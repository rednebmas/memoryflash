import { ChordMemoryChord } from 'MemoryFlashCore/src/types/Cards';
import { getDefaultChordMemoryChord } from 'MemoryFlashCore/src/lib/chordTones';

export function parseChordProgression(input: string): ChordMemoryChord[] {
	if (!input.trim()) return [];
	return input
		.split(/[\s,]+/)
		.filter(Boolean)
		.map(getDefaultChordMemoryChord);
}
