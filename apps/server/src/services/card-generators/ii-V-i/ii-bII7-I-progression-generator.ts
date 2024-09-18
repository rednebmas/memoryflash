import { Interval, Note, Progression, Scale } from 'tonal';
import { majorKeys } from 'MemoryFlashCore/src/lib/notes';
import { AnswerType, CardTypeEnum, StaffEnum } from 'MemoryFlashCore/src/types/Cards';
import { DeckWithoutGeneratedFields as IDeck } from 'MemoryFlashCore/src/types/Deck';
import { MultiSheetCard } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { PresentationMode } from 'MemoryFlashCore/src/types/PresentationMode';
import { createProgressionNotesFromChords } from './ii-V-I-progression-generators';

const presentationModes: PresentationMode[] = [
	{ id: 'Sheet Music' },
	{ id: 'Sheet Music w/ Chords' },
	{ id: 'Chords' },
	{ id: 'Key Signature Only', textAbove: 'ii bII7 I in the key of' },
	{ id: 'First Chord Only', textAbove: 'ii bII7 starting with' },
];

function getTritoneSubstitution(key: string): string {
	const scale = Scale.get(`${key} major`);
	const fifthDegree = scale.notes[4]; // V7 chord root
	const tritoneSubRoot = Note.transpose(fifthDegree, Interval.fromSemitones(6));
	const normalizedNote = Note.enharmonic(tritoneSubRoot); // Normalize to common notation
	return `${normalizedNote}7`;
}

function generateChords(
	uid: string,
	staff: StaffEnum,
	voicingDictionary: {
		[symbol: string]: string[];
	},
	range: string[] = ['C4', 'C7'],
) {
	return majorKeys.map((key) => {
		const iiChord = Progression.fromRomanNumerals(key, ['iim7'])[0];
		const tritoneSub = getTritoneSubstitution(key);
		const IChord = Progression.fromRomanNumerals(key, ['Imaj7'])[0];
		const chords = [iiChord, tritoneSub, IChord];

		const voice = createProgressionNotesFromChords(chords, range, voicingDictionary);
		const card: MultiSheetCard = {
			uid: `${chords.join(' ')} ${uid}`,
			type: CardTypeEnum.MultiSheet,
			question: {
				key: key,
				voices: [{ staff, stack: voice }],
				presentationModes: [...presentationModes],
			},
			answer: {
				type: AnswerType.ExactMulti,
			},
		};

		return card;
	});
}

export function singleHandedTritoneSub251(courseId: string) {
	const rhV1Cards = generateChords('rh iim7 bII7 Imaj7', StaffEnum.Treble, {
		m7: ['1P 3m 5P 7m'],
		'7': ['1P 3M 5P 7m'],
		maj7: ['1P 3M 5P 7M'],
	});
	const lhV1Cards = generateChords(
		'lh iim7 bII7 Imaj7',
		StaffEnum.Bass,
		{
			m7: ['1P 3m 5P 7m'],
			'7': ['1P 3M 5P 7m'],
			maj7: ['1P 3M 5P 7M'],
		},
		['B2', 'B4'],
	);
	lhV1Cards.forEach((c) => (c.question._8va = true));

	const rhV1Deck: IDeck = {
		uid: 'ii bII7 I version one block rh',
		courseId,
		name: 'Right Hand Tritone Sub',
		section: 'Tritone Sub',
		sectionSubtitle: '',
		tags: ['right hand'],
	};
	const lhV1Deck: IDeck = {
		uid: 'ii bII7 I version one block lh',
		courseId,
		name: 'Left Hand Tritone Sub',
		section: 'Tritone Sub',
		sectionSubtitle: '',
		tags: ['left hand'],
	};

	return {
		tritoneSubRhDeck: rhV1Deck,
		tritoneSubRhCards: rhV1Cards,
		tritoneSubLhDeck: lhV1Deck,
		tritoneSubLHCards: lhV1Cards,
	};
}

export function ii_bII_I_threeNoteVoicings() {
	//
}
