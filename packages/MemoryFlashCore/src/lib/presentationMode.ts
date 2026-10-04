import { PresentationMode } from '../types/PresentationMode';

export const presentationModeFor = (isTextPrompt: boolean, text: string): PresentationMode =>
	isTextPrompt ? { id: 'Text Prompt', text } : { id: 'Sheet Music' };
