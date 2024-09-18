import { DeckWithoutGeneratedFields as IDeck } from '../MemoryFlashCore/src/types/Deck';
import { createTwoHandedCardsFromProgressions } from '../create-two-handed-cards-from-progressions';
import { generateProgressionsFromRomanNumerals } from './ii-V-I-progression-generators';

function threeNoteCards_137(prefix: string) {
	return createTwoHandedCardsFromProgressions(
		prefix + (prefix ? ' ' : '') + '1 3 7 ii V I three note',
		'1 3 7 three note voicing in the key of',
		'1 3 7 three note voicing starting with',
		1,
		generateProgressionsFromRomanNumerals(['iim7', 'V7', 'Imaj7'], ['A2', 'C7'], {
			m7: ['1P 10m 14m'], // D3, F4, C5 - ii -  Dm7 - 1 3 7
			'7': ['1P 14m 17M'], // G2, F4, B4 - V - G7 - 1 7 3
			maj7: ['1P 10M 14M'], // C3, E4, B4 - I - Cmaj7 - 1 3 7
		}),
	);
}

function threeNoteCards_173(prefix: string) {
	return createTwoHandedCardsFromProgressions(
		prefix + (prefix ? ' ' : '') + '1 7 3 ii V I three note',
		'1 7 3 three note voicing in the key of',
		'1 7 3 three note voicing starting with',
		1,
		generateProgressionsFromRomanNumerals(['iim7', 'V7', 'Imaj7'], ['A2', 'C7'], {
			m7: ['1P 7m 10m'], // D3, C4, F4 - ii -  Dm7 - 1 7 3
			'7': ['1P 10M 14m'], // G2, B3, F4 - V - G7 - 1 3 7
			maj7: ['1P 7M 10M'], // C3, B3, E4 - I - Cmaj7 - 1 7 3
		}),
	);
}

export function twoFiveOneThreeNoteVoicings(courseId: string) {
	const allThreeNoteDeck: IDeck = {
		uid: 'ii V I three note 1 3 7 & 1 7 3 voicings',
		courseId,
		name: 'All Three Note Voicings',
		section: 'Three Note Voicings',
		sectionSubtitle: '',
		tags: ['both hands'],
	};

	const v1ThreeNoteDeck: IDeck = {
		uid: 'ii V I three note 1 3 7 voicings',
		courseId,
		name: 'v1 Three Note Voicings',
		section: 'Three Note Voicings',
		sectionSubtitle: '',
		tags: ['both hands'],
	};

	const v2ThreeNoteDeck: IDeck = {
		uid: 'ii V I three note 1 7 3 voicings',
		courseId,
		name: 'v2 Three Note Voicings',
		section: 'Three Note Voicings',
		sectionSubtitle: '',
		tags: ['both hands'],
	};

	return {
		allThreeNoteDeck,
		v1ThreeNoteDeck,
		v2ThreeNoteDeck,
		threeNoteCards_137: threeNoteCards_137(''),
		threeNoteCards_173: threeNoteCards_173(''),
		allThreeNoteCards: [...threeNoteCards_137('multideck'), ...threeNoteCards_173('multideck')],
	};
}
