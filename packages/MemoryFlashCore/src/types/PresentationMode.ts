export type PresentationModeStartCard = {
	id: 'Key Signature Only' | 'First Chord Only';
	textAbove: string;
};

export type PresentationModeIdCard = {
	id: 'Sheet Music' | 'Sheet Music w/ Chords' | 'Chords';
};

export type PresentationMode = PresentationModeIdCard | PresentationModeStartCard;

export type PresentationModeIds = PresentationMode['id'];
