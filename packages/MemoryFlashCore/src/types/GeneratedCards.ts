import { ChordNotation } from './Cards';
import { MultiSheetQuestion } from './MultiSheetCard';

export const GENERATED_CARD_TYPES = ['Sheet Music', 'Text Prompt', 'Chord Memory'] as const;
export type GeneratedCardType = (typeof GENERATED_CARD_TYPES)[number];
export type GeneratedSheetType = Exclude<GeneratedCardType, 'Chord Memory'>;

export type GeneratedPattern = {
	id: string;
	chords: string[];
	sections: string[];
};

export type GeneratedChordCard = {
	type: 'Chord Memory';
	prompt: string;
	chords: string[];
	key: string;
	notation: ChordNotation;
	patternId: string;
	invalidChords: string[];
};

export type GeneratedSheetCard = {
	type: GeneratedSheetType;
	prompt: string;
	question: MultiSheetQuestion;
	problems: string[];
};

export type GeneratedCard = GeneratedChordCard | GeneratedSheetCard;

export type GeneratedSong = {
	title: string;
	artist: string;
	key: string;
	patterns: GeneratedPattern[];
	cards: GeneratedCard[];
};

export type GenerateCardsInput = {
	text: string;
	instructions: string;
	cardTypes: GeneratedCardType[];
	splitLongSections: boolean;
	romanVariants: boolean;
	image?: string;
};

export const isGeneratedCardValid = (card: GeneratedCard) =>
	(card.type === 'Chord Memory' ? card.invalidChords : card.problems).length === 0;

export const wantsChords = (types: GeneratedCardType[]) => types.includes('Chord Memory');

export const sheetTypes = (types: GeneratedCardType[]) =>
	types.filter((t): t is GeneratedSheetType => t !== 'Chord Memory');

export type GenerationStage = 'uploading' | 'generating' | 'building';

export type GenerationJobStatus = { stage: GenerationStage; song?: GeneratedSong };
