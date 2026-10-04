import { Card } from '../types/Cards';
import {
	PresentationMode,
	PresentationModeIds,
	SHEET_DISPLAY_MODES,
	SheetDisplayMode,
} from '../types/PresentationMode';

export const presentationModesFor = (
	cardType: string,
	text: string,
	displayModes: SheetDisplayMode[],
): PresentationMode[] =>
	cardType === 'Text Prompt' || cardType === 'Chord Memory'
		? [{ id: 'Text Prompt', text }]
		: displayModes.map((id) => ({ id }));

export const displayModesOf = (modes: PresentationMode[] = []): SheetDisplayMode[] => {
	const ids = SHEET_DISPLAY_MODES.filter((id) => modes.some((m) => m.id === id));
	return ids.length ? ids : ['Sheet Music'];
};

export const activePresentationMode = (
	card: Card,
	preferred: { [cardType: string]: PresentationModeIds },
): PresentationMode | undefined => {
	const modes = card.question.presentationModes ?? [];
	return modes.find((m) => m.id === preferred[card.type]) ?? modes[0];
};
