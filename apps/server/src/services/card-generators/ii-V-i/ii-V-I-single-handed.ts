import { StaffEnum } from 'MemoryFlashCore/src/types/Cards';
import { DeckWithoutGeneratedFields as IDeck } from 'MemoryFlashCore/src/types/Deck';
import { generateCardsForProgression } from './ii-V-I-progression-generators';

export function singleHanded251_V1V2(courseId: string) {
	const rhV1Cards = generateCardsForProgression(
		['iim7', 'V7', 'Imaj7'],
		'rh v1',
		'ii V I starting with root i',
		StaffEnum.Treble,
		{
			m7: ['1P 3m 5P 7m'],
			'7': ['5P 7m 8P 10M'],
			maj7: ['1P 3M 5P 7M'],
		},
	);
	const lhV1Cards = generateCardsForProgression(
		['iim7', 'V7', 'Imaj7'],
		'lh v1',
		'ii V I starting with root i',
		StaffEnum.Bass,
		{
			m7: ['1P 3m 5P 7m'],
			'7': ['5P 7m 8P 10M'],
			maj7: ['1P 3M 5P 7M'],
		},
		['G2', 'G4'],
	);
	lhV1Cards.forEach((c) => (c.question._8va = true));

	const rhV2Cards = generateCardsForProgression(
		['iim7', 'V7', 'Imaj7'],
		'rh v2',
		'ii V I starting with second inversion i',
		StaffEnum.Treble,
		{
			m7: ['5P 7m 8P 10m'],
			'7': ['1P 3M 5P 7m'],
			maj7: ['5P 7M 8P 10M'],
		},
	);
	const lhV2Cards = generateCardsForProgression(
		['iim7', 'V7', 'Imaj7'],
		'lh v2',
		'ii V I starting with second inversion i',
		StaffEnum.Bass,
		{
			m7: ['5P 7m 8P 10m'],
			'7': ['1P 3M 5P 7m'],
			maj7: ['5P 7M 8P 10M'],
		},
		['G2', 'G4'],
	);
	lhV2Cards.forEach((c) => (c.question._8va = true));

	const rhV1Deck: IDeck = {
		uid: 'ii V I version one block rh',
		courseId,
		name: 'Right Hand v1',
		section: 'Simple',
		sectionSubtitle: '',
		tags: ['right hand'],
	};
	const lhV1Deck: IDeck = {
		uid: 'ii V I version one block lh',
		courseId,
		name: 'Left Hand v1',
		section: 'Simple',
		sectionSubtitle: '',
		tags: ['left hand'],
	};

	const rhV2Deck: IDeck = {
		uid: 'ii V I version two block rh',
		courseId,
		name: 'Right Hand v2',
		section: 'Simple',
		sectionSubtitle: '',
		tags: ['right hand'],
	};
	const lhV2Deck: IDeck = {
		uid: 'ii V I version two block lh',
		courseId,
		name: 'Left Hand v2',
		section: 'Simple',
		sectionSubtitle: '',
		tags: ['left hand'],
	};

	return {
		rhV1Deck,
		rhV1Cards,
		lhV1Deck,
		lhV1Cards,
		rhV2Deck,
		rhV2Cards,
		lhV2Deck,
		lhV2Cards,
	};
}
