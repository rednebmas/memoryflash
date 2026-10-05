import { Card } from '../types/Cards';
import { MultiSheetQuestion } from '../types/MultiSheetCard';
import {
	PresentationMode,
	PresentationModeIdCard,
	PresentationModeIds,
} from '../types/PresentationMode';
import { progressionChordNames, writtenChordNames } from './chordNames';

export const presentationModeFor = (cardType: string, text: string): PresentationMode =>
	cardType === 'Text Prompt' || cardType === 'Chord Memory'
		? { id: 'Text Prompt', text }
		: { id: 'Sheet Music' };

const chordModeIds = (q: MultiSheetQuestion): PresentationModeIdCard['id'][] => [
	...(writtenChordNames(q).some(Boolean) ? (['Sheet Music w/ Chords', 'Chords'] as const) : []),
	...(progressionChordNames(q).length ? (['Roman Numerals'] as const) : []),
];

const derivedModes = (card: Card, modes: PresentationMode[]): PresentationMode[] => {
	if (!('voices' in card.question) || !modes.some((m) => m.id.startsWith('Sheet Music')))
		return [];
	return chordModeIds(card.question)
		.filter((id) => !modes.some((m) => m.id === id))
		.map((id) => ({ id }));
};

const available = new WeakMap<Card['question'], PresentationMode[]>();

export const availablePresentationModes = (card: Card): PresentationMode[] => {
	const cached = available.get(card.question);
	if (cached) return cached;
	const modes = card.question.presentationModes ?? [];
	const result = [...modes, ...derivedModes(card, modes)];
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
