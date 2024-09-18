import { Chord, Progression, Note as TonalNote, Voicing } from 'tonal';
import Course from '../../../models/Course';
import { majorKeys } from '../../../submodules/MemoryFlashCore/src/lib/notes';
import {
	AnswerType,
	CardTypeEnum,
	StaffEnum,
} from '../../../submodules/MemoryFlashCore/src/types/Cards';
import {
	MultiSheetCard,
	SheetNote,
	StackedNotes,
} from '../../../submodules/MemoryFlashCore/src/types/MultiSheetCard';
import { PresentationMode } from '../../../submodules/MemoryFlashCore/src/types/PresentationMode';
import { VoicingDictionary } from '../../../submodules/MemoryFlashCore/src/types/VoicingDictionary';
import { upsertCourse } from '../upsert-course';
import { singleHandedTritoneSub251 } from './ii-bII7-I-progression-generator';
import { singleHanded251_V1V2 } from './ii-V-I-single-handed';
import { twoFiveOneThreeNoteVoicings } from './ii-V-I-three-note-voicings';

const presentationModes: PresentationMode[] = [
	{ id: 'Sheet Music' },
	{ id: 'Sheet Music w/ Chords' },
	{ id: 'Chords' },
];

export async function generate251s() {
	let course = await Course.findOne({ name: 'Two Five Ones' });
	if (!course) {
		course = new Course({ name: 'Two Five Ones', decks: [] });
	}

	const { rhV1Deck, rhV1Cards, lhV1Deck, lhV1Cards, rhV2Deck, rhV2Cards, lhV2Deck, lhV2Cards } =
		singleHanded251_V1V2(course.id);
	const {
		allThreeNoteDeck,
		allThreeNoteCards,
		v1ThreeNoteDeck,
		v2ThreeNoteDeck,
		threeNoteCards_137,
		threeNoteCards_173,
	} = twoFiveOneThreeNoteVoicings(course._id);
	const { tritoneSubRhDeck, tritoneSubRhCards, tritoneSubLhDeck, tritoneSubLHCards } =
		singleHandedTritoneSub251(course.id);

	return await upsertCourse(course, [
		[rhV1Deck, rhV1Cards],
		[lhV1Deck, lhV1Cards],
		[v1ThreeNoteDeck, threeNoteCards_137],
		[v2ThreeNoteDeck, threeNoteCards_173],
		[allThreeNoteDeck, allThreeNoteCards],
		[rhV2Deck, rhV2Cards],
		[lhV2Deck, lhV2Cards],
		[tritoneSubRhDeck, tritoneSubRhCards],
		[tritoneSubLhDeck, tritoneSubLHCards],
	]);
}

export function generateCardsForProgression(
	progression: string[],
	uid: string,
	textAbove: string,
	staff: StaffEnum,
	voicingDictionary: {
		[symbol: string]: string[];
	},
	range: string[] = ['C4', 'C7'],
) {
	return generateProgressionsFromRomanNumerals(progression, range, voicingDictionary).map(
		(progression): MultiSheetCard => {
			return {
				uid: `${progression.chords.join(' ')} ${uid}`,
				type: CardTypeEnum.MultiSheet,
				question: {
					key: progression.key,
					voices: [{ staff, stack: progression.voice }],
					presentationModes: [
						...presentationModes,
						{ id: 'Key Signature Only', textAbove },
						{ id: 'First Chord Only', textAbove },
					],
				},
				answer: {
					type: AnswerType.ExactMulti,
				},
			};
		},
	);
}

export function generateProgressionsFromRomanNumerals(
	romanNumerals: string[],
	firstChordRange: string[],
	voicingDictionary: VoicingDictionary | VoicingDictionary[],
) {
	const progressions: { voice: StackedNotes[]; key: string; chords: string[] }[] = [];
	majorKeys.forEach((key) => {
		const chords = Progression.fromRomanNumerals(key, romanNumerals);
		const voice = createProgressionNotesFromChords(chords, firstChordRange, voicingDictionary);

		progressions.push({ voice, key, chords });
	});
	return progressions;
}

export function createProgressionNotesFromChords(
	chords: string[],
	firstChordRange: string[],
	voicingDictionary: VoicingDictionary | VoicingDictionary[],
) {
	const progressionVoicings: string[][] = [];
	for (let i = 0; i < chords.length; i++) {
		const chord = Chord.get(chords[i]);

		const currentVoicingDictionary = Array.isArray(voicingDictionary)
			? voicingDictionary[i]
			: voicingDictionary;

		// This gets the closest for voicing from the previous chord
		const voicing = Voicing.get(
			chord.symbol,
			i === 0 ? firstChordRange : ['C2', 'E7'],
			currentVoicingDictionary,
			undefined,
			progressionVoicings[i - 1],
		);

		/*
		// For debugging lowest voicing
		if (
			firstChordRange[0] === 'B2' &&
			chords[0] == 'Bbm7' &&
			i == 0
		) {
			console.log('yo', chords);
			console.log(
				'Voicing search:',
				Voicing.search(
					chord.symbol,
					i === 0 ? firstChordRange : ['C2', 'E7'],
					currentVoicingDictionary,
				),
			);
		}
		if (voicing === undefined) {
			console.error(
				'No voicing found for chord:',
				chord.symbol,
				'in range:',
				i === 0 ? firstChordRange : ['C2', 'E7'],
			);
		}
		*/

		progressionVoicings.push(voicing);
	}

	const voice = progressionVoicings.map((chordNotes, i): StackedNotes => {
		const notes = chordNotes.map((note): SheetNote => {
			const tonalNote = TonalNote.get(note);
			return {
				name: tonalNote.pc,
				octave: tonalNote.oct || 4,
			};
		});

		return {
			notes,
			chordName: chords[i],
			duration: i === chords.length - 1 && chords.length === 3 ? 'h' : 'q',
		};
	});

	return voice;
}
