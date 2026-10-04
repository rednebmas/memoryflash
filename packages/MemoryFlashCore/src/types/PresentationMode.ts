export type PresentationModeStartCard = {
	id: 'Key Signature Only' | 'First Chord Only';
	textAbove: string;
};

export type PresentationModeIdCard = {
	id: 'Sheet Music' | 'Sheet Music w/ Chords' | 'Chords' | 'Roman Numerals';
};

export type PresentationModeText = {
	id: 'Text Prompt';
	text: string;
};

export type PresentationMode =
	PresentationModeIdCard | PresentationModeStartCard | PresentationModeText;

export type PresentationModeIds = PresentationMode['id'];

export const SHEET_DISPLAY_MODES = ['Sheet Music', 'Roman Numerals'] as const;

export type SheetDisplayMode = (typeof SHEET_DISPLAY_MODES)[number];
