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
