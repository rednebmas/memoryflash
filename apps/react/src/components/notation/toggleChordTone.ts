import { ChordMemorySettings } from './defaultSettings';

export function toggleChordTone(
	chordMemory: ChordMemorySettings,
	chordIndex: number,
	tone: string,
): ChordMemorySettings {
	return {
		...chordMemory,
		chordTones: chordMemory.chordTones.map((chord, i) => {
			if (i !== chordIndex) return chord;
			const isRequired = chord.requiredTones.includes(tone);
			if (isRequired && chord.requiredTones.length === 1) return chord;
			return isRequired
				? {
						...chord,
						requiredTones: chord.requiredTones.filter((t) => t !== tone),
						optionalTones: [...chord.optionalTones, tone],
					}
				: {
						...chord,
						requiredTones: [...chord.requiredTones, tone],
						optionalTones: chord.optionalTones.filter((t) => t !== tone),
					};
		}),
	};
}
