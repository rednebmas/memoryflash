import { ChordNotation } from './Cards';

export type GeneratedPattern = {
	id: string;
	chords: string[];
	sections: string[];
};

export type GeneratedCard = {
	prompt: string;
	chords: string[];
	key: string;
	notation: ChordNotation;
	patternId: string;
	invalidChords: string[];
};

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
	splitLongSections: boolean;
	romanVariants: boolean;
};
