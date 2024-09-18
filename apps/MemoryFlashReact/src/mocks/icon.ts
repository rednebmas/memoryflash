import { Hash, Note, HandLeft, HandRight, BothHands } from '../components';

// TODO: Figure out how icons will be displayed, as data for segments and sections will come from server
export const iconDisplay = (segment: string = '') => {
	switch (segment) {
		case 'Chord Symbols':
			return Hash;
		case 'Sheet Music':
			return Note;
		case 'Left Hand':
			return HandLeft;
		case 'Right Hand':
			return HandRight;
		case 'Both Hands':
			return BothHands;
		default:
			return undefined;
	}
};
