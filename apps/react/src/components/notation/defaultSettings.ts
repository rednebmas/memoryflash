import { NoteDuration } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { majorKeys } from 'MemoryFlashCore/src/lib/notes';

export interface NotationSettingsState {
	keySig: string;
	trebleDur: NoteDuration;
	bassDur: NoteDuration;
	lowest: string;
	highest: string;
	selected: boolean[];
	cardType: 'Sheet Music' | 'Text Prompt';
	textPrompt: string;
	preview: boolean;
}

export const defaultSettings: NotationSettingsState = {
	keySig: majorKeys[0],
	trebleDur: 'q',
	bassDur: 'q',
	lowest: 'C3',
	highest: 'C5',
	selected: majorKeys.map(() => true),
	cardType: 'Sheet Music',
	textPrompt: '',
	preview: false,
};
