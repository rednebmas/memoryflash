import { PresentationMode } from '../types/PresentationMode';

export const presentationModeFor = (cardType: string, text: string): PresentationMode => {
	if (cardType === 'Text Prompt' || cardType === 'Chord Memory')
		return { id: 'Text Prompt', text };
	if (cardType === 'Roman Numerals') return { id: 'Roman Numerals' };
	return { id: 'Sheet Music' };
};
