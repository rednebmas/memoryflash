import { majorKeys } from 'MemoryFlashCore/src/lib/notes';

export interface NotationSettingsState {
	keySig: string;
	lowest: string;
	highest: string;
	bars: number;
	selected: boolean[];
	cardType: 'Sheet Music' | 'Text Prompt';
	textPrompt: string;
	preview: boolean;
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
};
