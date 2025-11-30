import { majorKeys } from 'MemoryFlashCore/src/lib/notes';
import { CardType } from '../CardTypeDropdown';
import { ChordMemoryChord } from 'MemoryFlashCore/src/types/Cards';

export interface ChordMemorySettings {
	progression: string;
	chordTones: ChordMemoryChord[];
	textPrompt: string;
}

export interface NotationSettingsState {
	keySig: string;
	lowest: string;
	highest: string;
	bars: number;
	selected: boolean[];
	cardType: CardType;
	textPrompt: string;
	preview: boolean;
	chordMemory: ChordMemorySettings;
}

export const defaultSettings: NotationSettingsState = {
	keySig: majorKeys[0],
	lowest: 'C3',
	highest: 'C5',
	bars: 1,
	selected: [true, ...new Array(majorKeys.length - 1).fill(false)],
	cardType: 'Sheet Music',
	textPrompt: '',
	preview: false,
	chordMemory: {
		progression: '',
		chordTones: [],
		textPrompt: '',
	},
};
