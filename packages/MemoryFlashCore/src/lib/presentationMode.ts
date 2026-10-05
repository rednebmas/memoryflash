import { Card } from '../types/Cards';
import { PresentationMode, PresentationModeIds } from '../types/PresentationMode';
import { progressionChordNames } from './chordNames';

export const presentationModeFor = (cardType: string, text: string): PresentationMode =>
	cardType === 'Text Prompt' || cardType === 'Chord Memory'
		? { id: 'Text Prompt', text }
		: { id: 'Sheet Music' };

const offersRomanNumerals = (card: Card, modes: PresentationMode[]) =>
	'voices' in card.question &&
	modes.some((m) => m.id.startsWith('Sheet Music')) &&
	!modes.some((m) => m.id === 'Roman Numerals') &&
	progressionChordNames(card.question).length > 0;

const available = new WeakMap<Card['question'], PresentationMode[]>();

export const availablePresentationModes = (card: Card): PresentationMode[] => {
	const cached = available.get(card.question);
	if (cached) return cached;
	const modes = card.question.presentationModes ?? [];
	const result: PresentationMode[] = offersRomanNumerals(card, modes)
		? [...modes, { id: 'Roman Numerals' }]
		: modes;
	available.set(card.question, result);
	return result;
};

export const activePresentationMode = (
	card: Card,
	preferred: { [cardType: string]: PresentationModeIds },
): PresentationMode | undefined => {
	const modes = availablePresentationModes(card);
	return modes.find((m) => m.id === preferred[card.type]) ?? modes[0];
};

export const rendersAsText = (
	card: Card,
	preferred: { [cardType: string]: PresentationModeIds },
): boolean => {
	const id = activePresentationMode(card, preferred)?.id;
	return id === 'Text Prompt' || id === 'Roman Numerals';
};
