import { AnswerType, CardTypeEnum, StaffEnum } from 'MemoryFlashCore/src/types/Cards';
import { MultiSheetCard, StackedNotes } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { PresentationMode } from 'MemoryFlashCore/src/types/PresentationMode';
import { generateProgressionsFromRomanNumerals } from './ii-V-i/ii-V-I-progression-generators';

const presentationModes: PresentationMode[] = [
	{ id: 'Sheet Music' },
	{ id: 'Sheet Music w/ Chords' },
	{ id: 'Chords' },
];

export function createTwoHandedCardsFromProgressions(
	uid: string,
	textAboveKeySig: string,
	textAboveChord: string,
	numBassNotes: number,
	progressions: ReturnType<typeof generateProgressionsFromRomanNumerals>,
) {
	return progressions.map((progression, i): MultiSheetCard => {
		const bassStack: StackedNotes[] = [];
		const trebleStack: StackedNotes[] = [];

		progression.voice.forEach((voice, i) => {
			bassStack.push({ ...voice, notes: voice.notes.slice(0, numBassNotes) });
			trebleStack.push({ ...voice, notes: voice.notes.slice(numBassNotes) });
		});

		return {
			uid: `${progression.chords.join(' ')} ${uid}`,
			type: CardTypeEnum.MultiSheet,
			question: {
				key: progression.key,
				voices: [
					{ stack: trebleStack, staff: StaffEnum.Treble },
					{ stack: bassStack, staff: StaffEnum.Bass },
				],
				presentationModes: [
					...presentationModes,
					{
						id: 'Key Signature Only',
						textAbove: textAboveKeySig,
					},
					{
						id: 'First Chord Only',
						textAbove: textAboveChord,
					},
				],
			},
			answer: {
				type: AnswerType.ExactMulti,
			},
		};
	});
}
